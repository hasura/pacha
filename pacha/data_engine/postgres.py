from dataclasses import dataclass, field

import psycopg2._psycopg
from pacha.data_engine.catalog import Column, ScalarType, Catalog, Table, Schema
from pacha.data_engine import DataEngine, SqlOutput
import psycopg2

INTROSPECTION_QUERY = '''
WITH table_columns AS (
    SELECT
        table_name,
        table_schema,
        json_agg(
            json_build_object(
                'name',
                column_name,
                'type',
                data_type,
                'description',
                col_description(
                    concat(table_schema, '.', table_name) :: regclass,
                    c.ordinal_position
                )
            )
        ) as columns
    FROM
        information_schema.columns c
    GROUP BY
        table_name,
        table_schema
    ORDER BY
        table_schema,
        table_name
)
SELECT
    json_build_object(
        'tables',
        json_agg(
            json_build_object(
                'name',
                tc.table_name,
                'schema',
                tc.table_schema,
                'description',
                obj_description(concat(table_schema, '.', table_name) :: regclass),
                'columns',
                tc.columns
            )
        )
    )
FROM
    table_columns tc
WHERE
    tc.table_schema IN {included_schemas}
'''

STATEMENT_TIMEOUT = '5s'


def map_data_type(data_type: str) -> ScalarType:
    type_mapping = {
        'integer': ScalarType.INTEGER,
        'bigint': ScalarType.INTEGER,
        'smallint': ScalarType.INTEGER,
        'numeric': ScalarType.NUMERIC,
        'decimal': ScalarType.NUMERIC,
        'double precision': ScalarType.NUMERIC,
        'text': ScalarType.TEXT,
        'varchar': ScalarType.TEXT,
        'char': ScalarType.TEXT,
        'boolean': ScalarType.BOOLEAN,
        'date': ScalarType.DATE,
        'timestamp with time zone': ScalarType.TIMESTAMP,
        'timestamptz': ScalarType.TIMESTAMP,
        # This doesn't actually work since postgres returns "USER-DEFINED" as the type.
        'vector': ScalarType.VECTOR
    }
    return type_mapping.get(data_type, ScalarType.UNKNOWN)


def create_catalog_from_introspection(introspection) -> Catalog:
    schemas = {}
    for table_data in introspection["tables"]:
        schema_name = table_data["schema"]
        table_name = table_data["name"]
        schema = schemas.setdefault(schema_name, Schema(schema_name))
        columns = {}
        for column_data in table_data["columns"]:
            column = Column(name=column_data["name"], type=map_data_type(
                column_data["type"]), description=column_data["description"])
            columns[column.name] = column
        table = Table(
            name=table_name, description=table_data["description"], columns=columns)
        schema.tables[table.name] = table
    return Catalog(schemas=schemas)


@dataclass
class PostgresDataEngine(DataEngine):
    connection_string: str
    enable_semantic_search: bool = False
    included_schemas: list[str] = field(default_factory=lambda: ["public"])

    def get_catalog(self) -> Catalog:
        comma_separated_schemas = ', '.join(
            [f"'{schema}'" for schema in self.included_schemas])
        data = self.execute_sql(INTROSPECTION_QUERY.format(
            included_schemas=f'({comma_separated_schemas})'))
        catalog = create_catalog_from_introspection(
            next(iter(data[0].values())))
        if self.enable_semantic_search:
            catalog.semantic_search_enabled = True
        return catalog

    def execute_sql(self, sql: str) -> SqlOutput:
        connection = psycopg2.connect(self.connection_string)
        cursor = connection.cursor()
        cursor.execute(f"SET STATEMENT_TIMEOUT = '{STATEMENT_TIMEOUT}'")
        cursor.execute(f"SELECT json_agg(t) FROM ({
                       sql.strip("\n").strip(";")}) AS t")
        data = cursor.fetchall()
        result = data[0][0]
        result = [] if result is None else result
        return result

    def execute_mutation(self, sql: str):
        connection = psycopg2.connect(self.connection_string)
        cursor = connection.cursor()
        cursor.execute(sql)
        connection.commit()
