from dataclasses import dataclass, field
import traceback
from typing import Callable, Optional
from pacha.data_engine.data_engine import SqlHooks
from pacha.query_planner.instructions import *
from pacha.data_engine import DataEngine, SqlOutput
from pacha.query_planner.input import QueryPlanningInput
from pacha.query_planner.data_context import *
from pacha.utils.logging import get_logger
import pacha.utils.llm as llm
import pacha.utils.llm.llama as llama
import pacha.utils.llm.openai as openai


def noop(*args, **kwargs):
    pass


@dataclass
class PythonExecutorHooks:
    on_python_execute: Callable[[str], None] = noop
    on_python_output: Callable[[str], None] = noop
    sql: SqlHooks = field(default_factory=SqlHooks)


@dataclass
class PythonExecutor:
    data_engine: DataEngine
    hooks: PythonExecutorHooks
    sql_statements: list[SqlStatement] = field(default_factory=list)
    output_text: str = ""
    error: Optional[str] = None

    def get_from_database(self, sql: str) -> SqlOutput:
        self.hooks.sql.on_sql_request(sql)
        data = self.data_engine.execute_sql(sql)
        self.hooks.sql.on_sql_response(data)
        self.sql_statements.append(SqlStatement(sql, data))
        return data

    def output(self, text):
        self.output_text += str(text) + '\n'

    def exec_code(self, code: str):
        try:
            # TODO: This is not safe. Sandbox this.
            self.hooks.on_python_execute(code)
            exec(code, {"executor": self})
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
