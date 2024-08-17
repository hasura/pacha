from dataclasses import dataclass, field

from pacha.data_engine.catalog import Column, ScalarType, Catalog, Schema, Table, ForeignKey, ForeignKeyMapping, Function, Argument
from pacha.data_engine import DataEngine, SqlOutput
import requests
import argparse

TABLES_QUERY = '''
SELECT schema_name, table_name, description FROM hasura.table_metadata
'''

COLUMNS_QUERY = '''
SELECT h.schema_name,
       h.table_name,
       h.column_name,
       h.description,
       i.data_type
FROM hasura.column_metadata h
JOIN information_schema.columns i
ON h.table_name = i.table_name
AND h.schema_name = i.table_schema
AND h.column_name = i.column_name
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

FUNCTIONS_QUERY = '''
SELECT * from hasura.table_valued_function
'''

FUNCTIONS_FIELD_QUERY = '''
SELECT * from hasura.table_valued_function_field
'''

FUNCTIONS_ARGUMENT_QUERY = '''
SELECT * from hasura.table_valued_function_argument
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


# TODO: merge this with map_data_type function
def get_type_name(type_str: str) -> str:
    type_mapping = {
        "STRING": "string",
        "FLOAT32": "float",
        "BOOL": "boolean",
        "ARRAY<STRING>": "string[]",
    }
    if type_str.startswith("STRUCT<"):
        return "struct"
    return type_mapping.get(type_str, type_str.lower())


def create_schema_from_introspection(tables_data, columns_data, foreign_keys_data, functions_data, functions_field_data, functions_argument_data) -> Catalog:
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
            type=map_data_type(column_data["data_type"])
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
        
    for func in functions_data:
        function = Function(name=func["function_name"], description=func["description"])
        
        # Populate fields
        for field in functions_field_data:
            if field["function_name"] == function.name:
                column = Column(
                    name=field["field_name"],
                    type=get_type_name(field["field_type"]),
                    description=field["description"]
                )
                function.fields[column.name] = column

        # Populate arguments
        for arg in functions_argument_data:
            if arg["function_name"] == function.name:
                argument = Argument(
                    name=arg["argument_name"],
                    position=arg["argument_position"],
                    type=get_type_name(arg["argument_type"]),
                    description=arg["description"]
                )
                function.arguments[argument.name] = argument

        schema.functions[function.name] = function

    return Catalog(schemas=schemas)


@dataclass
class DdnDataEngine(DataEngine):
    url: str
    headers: dict[str, str] = field(default_factory=dict)

    def get_catalog(self) -> Catalog:
        tables = self.execute_sql(TABLES_QUERY)
        columns = self.execute_sql(COLUMNS_QUERY)
        foreign_keys = self.execute_sql(FOREIGN_KEYS_QUERY)
        functions = self.execute_sql(FUNCTIONS_QUERY)
        functions_field = self.execute_sql(FUNCTIONS_FIELD_QUERY)
        functions_argument = self.execute_sql(FUNCTIONS_ARGUMENT_QUERY)
        return create_schema_from_introspection(tables, columns, foreign_keys, functions, functions_field, functions_argument)

    def execute_sql(self, sql: str) -> SqlOutput:
        headers = {"Content-type": "application/json"} | self.headers
        data = {"sql": sql}
        response = requests.post(self.url, json=data, headers=headers)
        if response.headers["content-length"] == "0":
            return []
        response_json = response.json()
        if isinstance(response_json, list):
            return response_json
        if isinstance(response_json, dict):
            error = response_json.get("error")
            if error is not None:
                raise DdnDataEngineException(error)
        raise DdnDataEngineException(
            f"malformed DDN response: {response_json}")
