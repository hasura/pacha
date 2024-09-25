from dataclasses import dataclass, field
import traceback
from pydantic import BaseModel
from typing import Callable, Literal, Optional, Any, Union
from pacha.data_engine.artifacts import Artifacts, ArtifactType, ArtifactData
from pacha.data_engine.context import ExecutionContext
from pacha.data_engine.data_engine import SqlHooks
from pacha.data_engine import DataEngine, SqlOutput, SqlStatement
from pacha.data_engine.user_confirmations import UserConfirmationProvider, UserConfirmationResult
from pacha.error import PachaException
from pacha.sdk.llm import Llm
import copy
import asyncio


def noop(*args, **kwargs):
    pass


@dataclass
class PythonExecutorHooks:
    on_python_execute: Callable[[str], None] = noop
    on_python_output: Callable[[str], None] = noop
    sql: SqlHooks = field(default_factory=SqlHooks)

class HelloMessage(BaseModel):
    python: str
    
class PrintMessage(BaseModel):
    type: Literal["print"]
    text: str

class StoreArtifactMessage(BaseModel):
    type: Literal["store_artifact"]
    identifier: str
    title: str
    artifact_type: ArtifactType
    data: ArtifactData

class GetArtifactMessage(BaseModel):
    type: Literal["get_artifact"]
    identifier: str
    msg_id: int

class GetArtifactResponse(BaseModel):
    orig_msg_id: int
    contents: Any

class ClassifyMessage(BaseModel):
    type: Literal["classify"]
    instructions: str
    inputs_to_classify: list[str]
    categories: list[str]
    allow_multiple: bool
    msg_id: int

class ClassifyResponse(BaseModel):
    orig_msg_id: int
    results: list[str | list[str]]

class SummarizeMessage(BaseModel):
    type: Literal["summarize"]
    instructions: str
    input: Any
    msg_id: int

class SummarizeResponse(BaseModel):
    orig_msg_id: int
    summary: str

class RunSQLMessage(BaseModel):
    type: Literal["run_sql"]
    sql: str
    msg_id: int

class RunSQLResponse(BaseModel):
    orig_msg_id: int
    data: SqlOutput

@dataclass
class PythonExecutor:
    data_engine: DataEngine
    hooks: PythonExecutorHooks
    llm: Llm
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

    async def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
        self.maybe_cancel()
        if allow_multiple:
            system_prompt = f"""
                You are a classifier that classifies the user input into zero or more of these categories: {categories}
                {instructions}
                Your response must contain the list of applicable categories, one per line. If no cateogies apply, then simply respond with "None".
                Your response should contain with no fluff words (eg: nothing like "here is the category") or fluff characters (eg: no extra punctuation)
            """
        else:
            system_prompt = f"""
                You are a classifier that classifies the user input into one of these categories: {categories}
                {instructions}
                Your response must exactly be one of the possible categories with no fluff words (eg: nothing like "here is the category") or fluff characters (eg: no extra punctuation)
            """

        output: list[str | list[str]] = []
        for input in inputs_to_classify:
            answer = (await self.llm.ask(input, system_prompt)).strip()
            self.maybe_cancel()
            if allow_multiple:
                if answer == 'None':
                    output.append([])
                else:
                    output.append(answer.split('\n'))
            else:
                output.append(answer)
        return output
    
    async def summarize(self, instructions: str, input: str) -> str:
        self.maybe_cancel()
        system_prompt = f"""
            You are a summarization tool. Given the input from the user, summarize it according to these instructions. Response only with the summarized text and nothing else (eg: no fluff words like "here is the summary", and no chatting to the user).
            {instructions}
        """
        return await self.llm.ask(input, system_prompt)
    
    async def exec_code(self, code: str):
        try:
            from os import getenv
            from websockets.asyncio.client import connect
            from json import loads
            
            self.hooks.on_python_execute(code)
            
            token = getenv("PROMPTQL_SECRET_KEY")
            if token is None:
                raise PachaException("Expected PROMPTQL_SECRET_KEY")            
            
            headers = {
                "Authorization": f"Bearer {token}"
            }
            
            uri = getenv("PROMPTQL_URI")
            if uri is None:
                raise PachaException("Expected PROMPTQL_URI environment variable")
            
            async with connect(uri, additional_headers=headers) as websocket:
                hello_message = HelloMessage(python=code)
                await websocket.send(hello_message.json())

                async for message_json in websocket:
                    message_dict = loads(message_json)
                    # Determine the correct message class based on the type
                    message_type = message_dict.get("type")

                    match message_type:
                        case "print":
                            message = PrintMessage(**message_dict)
                            self.output(message.text)
                        case "store_artifact":
                            message = StoreArtifactMessage(**message_dict)

                            self.maybe_cancel()
                            output, is_stored = self.context.artifacts.store_artifact(
                                message.identifier, message.title, message.artifact_type, message.data)
                            if is_stored:
                                self.modified_artifact_identifiers.append(message.identifier)
                            self.output(output)
                        case "get_artifact":
                            message = GetArtifactMessage(**message_dict)
                            artifact = copy.deepcopy(self.context.artifacts.get_artifact(message.identifier))
                            await websocket.send(GetArtifactResponse(orig_msg_id=message.msg_id, contents=artifact).json())
                        case "classify":
                            message = ClassifyMessage(**message_dict)
                            results = await self.classify(message.instructions, message.inputs_to_classify, message.categories, message.allow_multiple)
                            await websocket.send(ClassifyResponse(orig_msg_id=message.msg_id, results=results).json())
                        case "summarize":
                            message = SummarizeMessage(**message_dict)
                            summary = await self.summarize(message.instructions, message.input)
                            await websocket.send(SummarizeResponse(orig_msg_id=message.msg_id, summary=summary).json())
                        case "run_sql":
                            message = RunSQLMessage(**message_dict)
                            sql = message.sql
                            
                            self.hooks.sql.on_sql_request(sql)

                            data = None
                            try:
                                data = await self.data_engine.execute_sql(sql)
                            except Exception as e:
                                if "Mutations are requested to be disallowed as part of the request" in str(e) and self.context.confirmation_provider is not None:
                                    confirmation = await self.context.confirmation_provider.request_confirmation(sql)
                                    if confirmation == UserConfirmationResult.APPROVED:
                                        data = await self.data_engine.execute_sql(sql, allow_mutations=True)
                                else:
                                    raise
                            if data is None:
                                raise PachaException(
                                    f"User did not approve execution of SQL mutation: {sql}")
                            
                            await websocket.send(RunSQLResponse(orig_msg_id=message.msg_id, data=data).json())
                        case _:
                            raise PachaException(f"Unsupported message type from Python sandbox server: {message_type}")
            
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
