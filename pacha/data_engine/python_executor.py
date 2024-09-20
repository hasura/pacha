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
    
    def maybe_cancel(self):
        current_task = asyncio.current_task()
        if current_task is not None and current_task.cancelled():
            self.output_text += "User Cancellation Requested...\n"
            raise asyncio.CancelledError('Cancelled Python Program')
        
    def output(self, text: str):
        self.maybe_cancel()
        self.output_text += str(text) + '\n'
        
    async def exec_code(self, code: str):
        try:
            from websockets.asyncio.client import connect
            from json import dumps, loads
            
            self.hooks.on_python_execute(code)
            
            async with connect("ws://localhost:3001/") as websocket:
                data = {
                    "python": code, 
                    "config": {
                        "engine_url": "http://localhost:3000",
                        "anthropic_api_key": os.environ.get('ANTHROPIC_API_KEY')
                    }
                }
                
                await websocket.send(dumps(data))
                
                async for message_json in websocket:
                    message = loads(message_json)
                    
                    match message['type']:
                        case "print": 
                            self.output(message['text'])
                        case "store_artifact":
                            contents = loads(message['contents'])
                            output = self.context.artifacts.store_artifact(
                                message['identifier'], contents['title'], contents['artifact_type'], contents['data'])
                            self.modified_artifact_identifiers.append(message['identifier'])
                            self.output(output)
                        case "get_artifact":
                            artifact = copy.deepcopy(self.context.artifacts.get_artifact(message['identifier']))
                            await websocket.send(dumps({
                                "orig_msg_id": message['msg_id'],
                                "contents": artifact
                            }))

            
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
