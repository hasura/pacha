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


def noop(*args, **kwargs):
    pass


@dataclass
class SqlHooks(ABC):
    on_sql_request: Callable[[str], None] = noop
    on_sql_response: Callable[[SqlOutput], None] = noop


class DataEngine(ABC):
    @abstractmethod
    def get_catalog(self) -> Catalog:
        ...

    @abstractmethod
    def execute_sql(self, sql: str) -> SqlOutput:
        ...
