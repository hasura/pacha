from dataclasses import dataclass, field

from promptql.sql.catalog import Argument, Column, Function, ScalarType, Catalog, Schema, Table, ForeignKey, ForeignKeyMapping, TypeReference
from promptql.sql.engine import MutationsDisallowed, SqlEngine, SqlOutput
import requests
import asyncio

TABLES_QUERY = '''
SELECT t.schema_name, 
       t.table_name, 
       t.description,
       st.description AS type_description
FROM hasura.table_metadata t
JOIN hasura.struct_type st
ON st.name = t.return_type
'''

COLUMNS_QUERY = '''
SELECT t.schema_name,
       t.table_name,
       f.field_name AS column_name,
       f.description,
       f.field_type AS data_type,
       f.field_type_normalized AS data_type_normalized,
       f.is_nullable
FROM hasura.table_metadata t
JOIN hasura.struct_type_field f
ON f.struct_type_name = t.return_type
'''

FOREIGN_KEYS_QUERY = '''
SELECT from_schema_name,
       from_table_name,
       from_column_name,
       to_schema_name,
       to_table_name,
       to_column_name
FROM hasura.inferred_foreign_key_constraints
'''

TABLE_VALUED_FUNCTIONS_QUERY = '''
SELECT tvf.function_name, 
       tvf.description,
       st.description AS type_description
FROM hasura.table_valued_function tvf
JOIN hasura.struct_type st
ON st.name = tvf.return_type
'''

TABLE_VALUED_FUNCTION_ARGUMENTS_QUERY = '''
SELECT function_name, 
       argument_name,
       argument_type,
       argument_type_normalized,
       is_nullable,
       description 
FROM hasura.table_valued_function_argument 
ORDER BY argument_position ASC
'''

TABLE_VALUED_FUNCTION_FIELDS_QUERY = '''
SELECT tvf.function_name, 
       f.field_name AS column_name,
       f.description,
       f.field_type AS data_type,
       f.field_type_normalized AS data_type_normalized,
       f.is_nullable
FROM hasura.table_valued_function tvf
JOIN hasura.struct_type_field f
ON f.struct_type_name = tvf.return_type
'''


@dataclass
class DdnDataEngineException(Exception):
    def __init__(self, message):
        super().__init__(message)


def map_data_type(data_type: str) -> ScalarType | str:
    data_type_lower = data_type.lower()
    if data_type_lower.startswith("int"):
        return ScalarType.INTEGER
    if data_type_lower.startswith("float"):
        return ScalarType.NUMERIC
    if data_type_lower.startswith("utf"):
        return ScalarType.TEXT
    if data_type_lower.startswith("bool"):
        return ScalarType.BOOLEAN
    if data_type_lower.startswith("date"):
        return ScalarType.DATE
    if data_type_lower.startswith("timestamp"):
        return ScalarType.TIMESTAMP
    return data_type


def create_schema_from_introspection(
        tables_data,
        columns_data,
        foreign_keys_data,
        table_valued_functions_data,
        table_valued_function_arguments_data,
        table_valued_function_fields_data,
) -> Catalog:
    schemas: dict[str, Schema] = {}
    for table_data in tables_data:
        schema_name = table_data["schema_name"]
        table_name = table_data["table_name"]
        schema = schemas.setdefault(schema_name, Schema(schema_name))
        schema.tables[table_name] = Table(
            table_name, table_data["description"])

    for column_data in columns_data:
        column_name = column_data["column_name"]
        schema = schemas[column_data["schema_name"]]
        table = schema.tables[column_data["table_name"]]
        column = Column(
            name=column_name,
            description=column_data["description"],
            type=TypeReference(nullable=column_data["is_nullable"] == "YES", underlying_type=map_data_type(
                column_data["data_type"]))
        )
        table.columns[column.name] = column

    for foreign_key_data in foreign_keys_data:
        source_table = schemas[foreign_key_data["from_schema_name"]
                               ].tables[foreign_key_data["from_table_name"]]
        target_schema_name = foreign_key_data["to_schema_name"]
        target_table_name = foreign_key_data["to_table_name"]
        foreign_key = next((foreign_key for foreign_key in source_table.foreign_keys if foreign_key.target_schema ==
                           target_schema_name and foreign_key.target_table == target_table_name), None)
        if foreign_key is None:
            foreign_key = ForeignKey(
                target_schema=target_schema_name, target_table=target_table_name)
            source_table.foreign_keys.append(foreign_key)
        foreign_key.mapping.append(ForeignKeyMapping(
            source_column=foreign_key_data["from_column_name"], target_column=foreign_key_data["to_column_name"]))

    functions: dict[str, Function] = {}
    for function_data in table_valued_functions_data:
        function = Function(name=function_data['function_name'], arguments={
        }, result_type={}, description=function_data['description'])
        functions[function.name] = function

    for field_data in table_valued_function_arguments_data:
        field = Argument(name=field_data['argument_name'], type=TypeReference(
            nullable=field_data['is_nullable'], underlying_type=map_data_type(field_data['argument_type'])), description=field_data['description'])
        functions[field_data['function_name']].arguments[field.name] = field

    for field_data in table_valued_function_fields_data:
        column = Column(name=field_data['column_name'], type=TypeReference(
            nullable=field_data['is_nullable'], underlying_type=map_data_type(field_data['data_type'])), description=field_data['description'])
        functions[field_data['function_name']
                  ].result_type[column.name] = column

    return Catalog(schemas=schemas, functions=functions)


@dataclass
class DdnSqlEngine(SqlEngine):
    url: str
    headers: dict[str, str] = field(default_factory=dict)

    async def get_catalog(self) -> Catalog:
        tables_data, columns_data, foreign_keys_data, table_valued_functions_data, table_valued_function_arguments_data, table_valued_function_fields_data, = await asyncio.gather(
            self.execute_sql(TABLES_QUERY),
            self.execute_sql(COLUMNS_QUERY),
            self.execute_sql(FOREIGN_KEYS_QUERY),
            self.execute_sql(TABLE_VALUED_FUNCTIONS_QUERY),
            self.execute_sql(TABLE_VALUED_FUNCTION_ARGUMENTS_QUERY),
            self.execute_sql(TABLE_VALUED_FUNCTION_FIELDS_QUERY))
        catalog = create_schema_from_introspection(tables_data, columns_data, foreign_keys_data,
                                                   table_valued_functions_data, table_valued_function_arguments_data, table_valued_function_fields_data)

        return catalog

    async def execute_sql(self, sql: str, allow_mutations: bool = False) -> SqlOutput:
        headers = {"Content-type": "application/json"} | self.headers
        data = {"sql": sql, "disallowMutations": not allow_mutations}
        response = requests.post(self.url, json=data, headers=headers)
        if response.headers["content-length"] == "0":
            return []
        response_json = response.json()
        if isinstance(response_json, list):
            return response_json
        if isinstance(response_json, dict):
            error = response_json.get("error")
            if error is not None:
                if "Mutations are requested to be disallowed as part of the request" in str(error):
                    raise MutationsDisallowed()
                else:
                    raise DdnDataEngineException(error)
        raise DdnDataEngineException(
            f"malformed DDN response: {response_json}")
