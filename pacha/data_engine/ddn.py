from dataclasses import dataclass, field

from pacha.data_engine.catalog import Column, ScalarType, Catalog, Schema, Table
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


@dataclass
class DdnDataEngineException(Exception):
    def __init__(self, message):
        super().__init__(message)


def map_data_type(data_type: str) -> ScalarType:
    data_type = data_type.lower()
    if data_type.startswith("int"):
        return ScalarType.INTEGER
    if data_type.startswith("float"):
        return ScalarType.NUMERIC
    if data_type.startswith("utf"):
        return ScalarType.TEXT
    if data_type.startswith("bool"):
        return ScalarType.BOOLEAN
    if data_type.startswith("date"):
        return ScalarType.DATE
    if data_type.startswith("timestamp"):
        return ScalarType.TIMESTAMP
    return ScalarType.UNKNOWN


def create_schema_from_introspection(tables_data, columns_data) -> Catalog:
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
    return Catalog(schemas=schemas)


@dataclass
class DdnDataEngine(DataEngine):
    url: str
    headers: dict[str, str] = field(default_factory=dict)

    def get_catalog(self) -> Catalog:
        tables = self.execute_sql(TABLES_QUERY)
        columns = self.execute_sql(COLUMNS_QUERY)
        return create_schema_from_introspection(tables, columns)

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
