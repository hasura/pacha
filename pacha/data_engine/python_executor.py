from dataclasses import dataclass, field
from pydantic import BaseModel, RootModel, Field
from typing import Annotated, Callable, Literal, Optional, Any, Union, override
from pacha.data_engine.artifacts import ArtifactType, ArtifactData
from pacha.data_engine.context import ExecutionContext
from pacha.data_engine.data_engine import SqlHooks
from pacha.data_engine import DataEngine, SqlOutput, SqlStatement
from pacha.data_engine.user_confirmations import UserConfirmationProvider, UserConfirmationResult
from pacha.error import PachaException
from pacha.sdk.llm import Llm
from websockets.asyncio.client import connect
from json import loads
import copy
import asyncio
import traceback

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
    contents: ArtifactData

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

class MutationsDisallowed(Exception):
    def __init__(self):
        super().__init__("Mutations are disallowed")

ServerMessage = RootModel[
    Annotated[
        Union[
            StoreArtifactMessage,
            GetArtifactMessage,
            ClassifyMessage,
            SummarizeMessage,
            RunSQLMessage
        ], 
        Field(discriminator='type')
    ]]

class ClientHooks:
    async def maybe_cancel(self):
        current_task = asyncio.current_task()
        if current_task is not None and current_task.cancelled():
            await self.print("User Cancellation Requested...")
            raise asyncio.CancelledError('Cancelled Python Program')
        
    async def print(self, text: str):
        """Print a message"""
        pass

    async def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData):
        """Store an artifact"""
        pass
    
    async def get_artifact(self, identifier: str) -> ArtifactData:
        """Get an artifact"""
        pass
    
    async def run_sql(self, sql: str, allow_mutations: bool) -> SqlOutput:
        pass
    
    async def request_confirmation(self, sql: str) -> bool:
        pass
    
    async def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
        pass
    
    async def summarize(self, instructions: str, input: str) -> str:
        pass
    
@dataclass
class Client:
    api_token: str
    uri: str
    hooks: ClientHooks
    
    async def exec_code(self, code: str):       
        headers = {
            "Authorization": f"Bearer {self.api_token}"
        }
        
        async with connect(self.uri, additional_headers=headers) as websocket:
            hello_message = HelloMessage(python=code)
            await websocket.send(hello_message.json())

            async for message_json in websocket:
                message_dict = loads(message_json)
                # Determine the correct message class based on the type
                message = ServerMessage(**message_dict)

                match message:
                    case PrintMessage():
                        await self.hooks.print(message.text)
                    case StoreArtifactMessage():
                        await self.hooks.maybe_cancel()
                        await self.hooks.store_artifact(message.identifier, message.title, message.artifact_type, message.data)
                    case GetArtifactMessage():
                        artifact = await self.hooks.get_artifact(message.identifier)
                        await websocket.send(GetArtifactResponse(orig_msg_id=message.msg_id, contents=artifact).json())
                    case ClassifyMessage():
                        results = await self.hooks.classify(message.instructions, message.inputs_to_classify, message.categories, message.allow_multiple)
                        await websocket.send(ClassifyResponse(orig_msg_id=message.msg_id, results=results).json())
                    case SummarizeMessage():
                        summary = await self.hooks.summarize(message.instructions, message.input)
                        await websocket.send(SummarizeResponse(orig_msg_id=message.msg_id, summary=summary).json())
                    case RunSQLMessage():
                        data = None
                        
                        try:
                            data = await self.hooks.run_sql(message.sql, allow_mutations=False)
                        except MutationsDisallowed:
                            if await self.hooks.request_confirmation(message.sql):
                                data = await self.hooks.run_sql(message.sql, allow_mutations=True)
                            else:
                                raise
                            
                        if data is None:
                            raise PachaException(
                                f"User did not approve execution of SQL mutation: {message.sql}")
                        
                        await websocket.send(RunSQLResponse(orig_msg_id=message.msg_id, data=data).json())
                    case _:
                        raise PachaException(f"Unsupported message type from Python sandbox server: {message.type}")

@dataclass
class PythonExecutor(ClientHooks):
    data_engine: DataEngine
    hooks: PythonExecutorHooks
    llm: Llm
    context: ExecutionContext
    sql_statements: list[SqlStatement] = field(default_factory=list)
    output_text: str = ""
    error: Optional[str] = None
    modified_artifact_identifiers: list[str] = field(default_factory=list)

    @override
    async def print(self, text: str):
        await self.maybe_cancel()
        self.output_text += str(text) + '\n'

    @override
    async def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData):
        """Store an artifact"""
        output, is_stored = self.context.artifacts.store_artifact(
            identifier, title, artifact_type, data)
        if is_stored:
            self.modified_artifact_identifiers.append(identifier)
        await self.print(output)
    
    @override
    async def get_artifact(self, identifier: str) -> ArtifactData:
        """Get an artifact"""
        return copy.deepcopy(self.context.artifacts.get_artifact(identifier))
    
    @override
    async def request_confirmation(self, sql: str) -> bool:
        if self.context.confirmation_provider is None:
            return False
        else:
            confirmation = await self.context.confirmation_provider.request_confirmation(sql)
            return confirmation == UserConfirmationResult.APPROVED

    @override
    async def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
        await self.maybe_cancel()
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
            await self.maybe_cancel()
            if allow_multiple:
                if answer == 'None':
                    output.append([])
                else:
                    output.append(answer.split('\n'))
            else:
                output.append(answer)
        return output
    
    @override
    async def summarize(self, instructions: str, input: str) -> str:
        await self.maybe_cancel()
        system_prompt = f"""
            You are a summarization tool. Given the input from the user, summarize it according to these instructions. Response only with the summarized text and nothing else (eg: no fluff words like "here is the summary", and no chatting to the user).
            {instructions}
        """
        return await self.llm.ask(input, system_prompt)
    
    @override
    async def run_sql(self, sql: str, allow_mutations: bool) -> SqlOutput:
        try:
            return await self.data_engine.execute_sql(sql, allow_mutations)
        except Exception as e:
            if "Mutations are requested to be disallowed as part of the request" in str(e):
                raise MutationsDisallowed()
            else:
                raise
    
    async def exec_code(self, code: str):
        try:
            from os import getenv
            
            self.hooks.on_python_execute(code)
            
            token = getenv("PROMPTQL_SECRET_KEY")
            if token is None:
                raise PachaException("Expected PROMPTQL_SECRET_KEY")            
            
            uri = getenv("PROMPTQL_URI")
            if uri is None:
                raise PachaException("Expected PROMPTQL_URI environment variable")
            
            client = Client(api_token=token, uri=uri, hooks=self)
            
            await client.exec_code(code)
            
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
