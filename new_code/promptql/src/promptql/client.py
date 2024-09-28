from abc import ABC, abstractmethod
from dataclasses import dataclass
from pydantic import RootModel
from promptql.ai_primitives.classify import Classifier
from promptql.ai_primitives.summarize import Summarizer
from promptql.artifacts import Artifact, ArtifactType, ArtifactData, ArtifactsProvider
from promptql.confirmation import ConfirmationProvider
from promptql.protocol import ClassifyMessage, ClassifyResponse, ErrorMessage, GetArtifactMessage, GetArtifactResponse, HelloMessage, PrintMessage, RunSQLMessage, RunSQLResponse, ServerMessage, StoreArtifactMessage, SummarizeMessage, SummarizeResponse
from promptql.sql.engine import MutationsDisallowed, SqlEngine, SqlOutput
from promptql.error import PromptQlException
from websockets.asyncio.client import connect
import asyncio


from typing import Annotated, Any, AsyncGenerator, Literal, Optional, Union
from pydantic import BaseModel, Field

from promptql.artifacts import ArtifactData, ArtifactType
from promptql.sql.engine import SqlOutput


class InvalidCodeError(Exception):
    def __init__(self, message):
        super().__init__("message")


@dataclass
class CodeOutput:
    output: str


@dataclass
class CodeError:
    error: str


@dataclass
class ArtifactUpdate:
    artifact: Artifact


PromptQlExecutionUpdate = Union[CodeOutput, CodeError, ArtifactUpdate]


@dataclass
class PromptQlExecutionResult:
    output: str
    error: Optional[str]
    modified_artifacts: list[Artifact]


@dataclass
class PromptQl:
    uri: str
    api_token: Optional[str]
    sql_engine: SqlEngine
    classifier: Optional[Classifier]
    summarizer: Optional[Summarizer]
    artifacts_provider: Optional[ArtifactsProvider]
    confirmation_provider: Optional[ConfirmationProvider]

    async def exec_code_streaming(self, code: str) -> AsyncGenerator[PromptQlExecutionUpdate, None]:
        headers = {}
        if self.api_token is not None:
            headers["Authorization"] = f"Bearer {self.api_token}"

        async with connect(self.uri, additional_headers=headers) as websocket:
            hello_message = HelloMessage(python=code)
            await websocket.send(hello_message.model_dump_json())

            async for message_json in websocket:
                message = RootModel[ServerMessage].model_validate_json(
                    message_json).root

                try:
                    match message:
                        case PrintMessage():
                            yield CodeOutput(output=message.text + '\n')
                        case ErrorMessage():
                            raise InvalidCodeError(message.message)
                        case StoreArtifactMessage():
                            if self.artifacts_provider is None:
                                raise InvalidCodeError(
                                    "artifacts are not enabled")
                            artifact = await self.artifacts_provider.store_artifact(message.identifier, message.title, message.artifact_type, message.data)
                            yield ArtifactUpdate(artifact)
                            yield CodeOutput(output=f'Stored {artifact.render_for_prompt()}\n')
                        case GetArtifactMessage():
                            if self.artifacts_provider is None:
                                raise InvalidCodeError(
                                    "artifacts are not enabled")
                            artifact = await self.artifacts_provider.get_artifact_data(message.identifier)
                            await websocket.send(GetArtifactResponse(orig_msg_id=message.msg_id, contents=artifact).model_dump_json())
                        case ClassifyMessage():
                            if self.classifier is None:
                                raise InvalidCodeError(
                                    "classification is not enabled")
                            results = await self.classifier.classify(message.instructions, message.inputs_to_classify, message.categories, message.allow_multiple)
                            await websocket.send(ClassifyResponse(orig_msg_id=message.msg_id, results=results).model_dump_json())
                        case SummarizeMessage():
                            if self.summarizer is None:
                                raise InvalidCodeError(
                                    "classification is not enabled")
                            summary = await self.summarizer.summarize(message.instructions, message.input)
                            await websocket.send(SummarizeResponse(orig_msg_id=message.msg_id, summary=summary).model_dump_json())
                        case RunSQLMessage():
                            data = None

                            try:
                                data = await self.sql_engine.execute_sql(message.sql, allow_mutations=False)
                            except MutationsDisallowed:
                                if self.confirmation_provider is not None and await self.confirmation_provider.request_confirmation(message.sql):
                                    data = await self.sql_engine.execute_sql(message.sql, allow_mutations=True)
                                else:
                                    raise

                            if data is None:
                                raise PromptQlException(
                                    f"User did not approve execution of SQL mutation: {message.sql}")

                            await websocket.send(RunSQLResponse(orig_msg_id=message.msg_id, data=data).model_dump_json())
                except Exception as e:
                    yield CodeError(str(e))

        async def exec_code(self, code: str) -> PromptQlExecutionResult:
            output = ""
            error = None
            artifacts = []
            async for update in self.exec_code_streaming(code):
                match update:
                    case CodeOutput():
                        output += update.output
                    case CodeError():
                        error = update.error
                        break
                    case ArtifactUpdate():
                        artifacts.append(update.artifact)
            return PromptQlExecutionResult(output=output, error=error, modified_artifacts=artifacts)
