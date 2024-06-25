from dataclasses import dataclass
from typing import Any, Callable
from abc import ABC, abstractmethod
from pacha.data_engine.catalog import Catalog

SqlOutput = list[dict[str, Any]]

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

