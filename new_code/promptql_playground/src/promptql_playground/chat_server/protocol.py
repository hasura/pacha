from abc import ABC, abstractmethod
from typing import Annotated, Literal, Optional, Union
from uuid import UUID
from pydantic import BaseModel, Field, RootModel
from promptql.artifacts import Artifact

# Client sent events


class ClientInit(BaseModel):
    type: Literal['client_init']
    version: Literal['v1']


class UserMessage(BaseModel):
    type: Literal['user_message']
    message: str


class UserConfirmationResponse(BaseModel):
    type: Literal['user_confirmation_response']
    response: Literal['approve', 'deny']


ClientMessage = Annotated[Union[ClientInit, UserMessage,
                                UserConfirmationResponse], Field(discriminator='type')]

# Server events


class AcceptInteraction(BaseModel):
    type: Literal['accept_interaction']
    interaction_id: UUID


class LlmCall(BaseModel):
    type: Literal['llm_call']
    assistant_action_id: UUID


class CodeChunk(BaseModel):
    code_block_id: Literal['']


class AssistantMessageResponse(BaseModel):
    type: Literal['assistant_message_response']
    assistant_action_id: UUID
    message_chunk: str


class AssistantCodeResponse(BaseModel):
    type: Literal['assistant_code_response']
    assistant_action_id: UUID
    code_block_id: UUID
    code_chunk: str


class ExecutingCode(BaseModel):
    type: Literal['executing_code']
    code_block_id: UUID


class CodeOutput(BaseModel):
    type: Literal['code_output']
    code_block_id: UUID
    output_chunk: str


class ArtifactUpdate(BaseModel):
    type: Literal['artifact_update']
    artifact: Artifact


class CodeError(BaseModel):
    type: Literal['code_error']
    code_block_id: UUID
    error: str


class UserConfirmationRequest(BaseModel):
    type: Literal['user_confirmation_request']
    message: str
    confirmation_request_id: UUID


class UserConfirmationTimeout(BaseModel):
    type: Literal['user_confirmation_timeout']
    confirmation_request_id: UUID


class ServerError(BaseModel):
    type: Literal['server_error']
    message: str


class ServerCompletion(BaseModel):
    type: Literal['completion']


ServerMessage = Annotated[Union[AcceptInteraction, LlmCall, AssistantMessageResponse, AssistantCodeResponse, ExecutingCode, CodeOutput, ArtifactUpdate,
                                CodeError, UserConfirmationRequest, UserConfirmationTimeout, ServerError, ServerCompletion], Field(discriminator='type')]


class WebSocket(ABC):
    @abstractmethod
    async def send(self, message: ServerMessage):
        ...

    @abstractmethod
    async def recv(self) -> ClientMessage:
        ...

"""
Client <-> Server
-> { type: "client_init", version: "v1" }
-> { type: "user_message", message: "issue $10 in credits to abhinav@hasura.io" }
<- { type: "llm_call" }
<- { type: "assistant_response", response_chunk: "Okay, I will" }
<- { type: "assistant_response", response_chunk: "issue credits" }
<- { type: "assistant_response", response_chunk: "to abhinav@hasura.io", code_chunk: "sql = '\n" }
<- { type: "assistant_response", code_chunk: "..." }
<- { type: "assistant_response", code_chunk: "..." }
<- { type: "executing_code" }
<- { type: "code_output", output_chunk: "user_id of abhinav@hasura.io is 1234" }
<- { type: "code_error", error: "unknown table 'project'" }
<- { type: "llm_call" }
<- { type: "assistant_response", response_chunk: "Apologies, let me fix the error" }
<- { type: "assistant_response", code_chunk: "..." }
<- { type: "assistant_response", code_chunk: "..." }
<- { type: "executing_code" }
<- { type: "code_output", output_chunk: "project_id of abhinav@hasura.io is 5678" }
<- { type: "artifact_update", artifact: { type: "table", data: { ... } } }
<- { type: "code_output", output_chunk: "issuing credits..." }
<- { type: "user_confirmation_request", message: "SELECT * FROM IssueCredits(...)" }
-> { type: "user_confirmation_response", response: "approve" }
<- { type: "code_output", output_chunk: "refund issued"}
<- { type: "llm_call" }
<- { type: "assistant_response", response_chunk: "all done" }
<- { type: "completion" }
"""