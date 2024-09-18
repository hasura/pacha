from dataclasses import dataclass, field
import traceback
from typing import Callable, Optional
from pacha.data_engine.artifacts import ArtifactData, ArtifactType, Artifacts
from pacha.data_engine.context import ExecutionContext
from pacha.data_engine.data_engine import SqlHooks
from pacha.data_engine import DataEngine, SqlOutput, SqlStatement
from pacha.data_engine.user_confirmations import UserConfirmationProvider, UserConfirmationResult
from pacha.error import PachaException
from pacha.sdk.llm import Llm
import copy
import asyncio
import os
import requests

def noop(*args, **kwargs):
    pass


@dataclass
class PythonExecutorHooks:
    on_python_execute: Callable[[str], None] = noop
    on_python_output: Callable[[str], None] = noop
    sql: SqlHooks = field(default_factory=SqlHooks)


@dataclass
class PythonExecutor:
    hooks: PythonExecutorHooks
    context: ExecutionContext
    sql_statements: list[SqlStatement] = field(default_factory=list)
    output_text: str = ""
    error: Optional[str] = None
    modified_artifact_identifiers: list[str] = field(default_factory=list)
   
    async def exec_code(self, code: str):
        try:
            self.hooks.on_python_execute(code)
            
            headers = {"Content-type": "application/json"}
            data = {"python": code, "config": {
                "engine_url": "http://localhost:3000",
                "anthropic_api_key": os.environ.get('ANTHROPIC_API_KEY')
            }}
            response = requests.post("http://localhost:3001/execute", json=data, headers=headers)
            self.output_text = response.text
            
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
