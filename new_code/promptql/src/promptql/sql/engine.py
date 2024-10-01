from dataclasses import dataclass
from typing import Any, Callable
from abc import ABC, abstractmethod

from pydantic import BaseModel
from promptql.sql.catalog import Catalog

SqlOutput = list[dict[str, Any]]


class SqlStatement(BaseModel):
    sql: str
    result: SqlOutput


class MutationsDisallowed(Exception):
    def __init__(self):
        super().__init__("Mutations are disallowed")


class SqlEngine(ABC):
    @abstractmethod
    async def get_catalog(self) -> Catalog:
        ...

    @abstractmethod
    async def execute_sql(self, sql: str, allow_mutations: bool = False) -> SqlOutput:
        ...
