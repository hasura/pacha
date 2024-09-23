from dataclasses import dataclass
from typing import Any, Callable, TypedDict
from abc import ABC, abstractmethod
from pacha.data_engine.catalog import Catalog

SqlOutput = list[dict[str, Any]]


class SqlStatementJson(TypedDict):
    sql: str
    result: SqlOutput


@dataclass
class SqlStatement:
    sql: str
    result: SqlOutput

    def to_json(self) -> SqlStatementJson:
        return {
            "sql": self.sql,
            "result": self.result
        }

    @classmethod
    def from_json(cls, json_data: SqlStatementJson) -> 'SqlStatement':
        return cls(
            sql=json_data['sql'],
            result=json_data['result']
        )


def noop(*args, **kwargs):
    pass


@dataclass
class SqlHooks(ABC):
    on_sql_request: Callable[[str], None] = noop
    on_sql_response: Callable[[SqlOutput], None] = noop


class DataEngine(ABC):
    @abstractmethod
    async def get_catalog(self) -> Catalog:
        ...

    @abstractmethod
    async def execute_sql(self, sql: str, allow_mutations: bool = False) -> SqlOutput:
        ...
