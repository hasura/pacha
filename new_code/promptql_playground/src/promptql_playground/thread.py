from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from promptql.artifacts import Artifact
from promptql.sql import SqlStatement
from promptql.llm import ToolCall
from pydantic import BaseModel, Field
from uuid import UUID, uuid4


class UserConfirmationResponseStatus(str, Enum):
    timeout = 'timeout'
    approve = 'approve'
    deny = 'deny'


class UserConfirmationResponse(BaseModel):
    timestamp: datetime
    status: UserConfirmationResponseStatus


class UserConfirmation(BaseModel):
    confirmation_request_id: UUID
    request_timestamp: datetime
    message: str
    response: Optional[UserConfirmationResponse] = None


class CodeBlock(BaseModel):
    code_block_id: UUID
    code: str
    execution_start_timestamp: datetime
    execution_end_timestamp: Optional[datetime] = None
    output: Optional[str] = None
    error: Optional[str] = None
    user_confirmations: list[UserConfirmation] = Field(default_factory=list)
    sql_statements: list[SqlStatement] = Field(default_factory=list)
    internal_tool_call: ToolCall


class AssistantAction(BaseModel):
    action_id: UUID
    response_start_timestamp: datetime
    message: Optional[str] = None
    code: Optional[CodeBlock] = None
    # If this is None, it means there was an error
    action_end_timestamp: Optional[datetime] = None
    tokens_used: int


class UserMessage(BaseModel):
    timestamp: datetime
    message: str


class ThreadInteraction(BaseModel):
    interaction_id: UUID
    user_message: UserMessage
    assistant_actions: list[AssistantAction]
    # If this is None and error is None, it means UX should render something like "Assistant interrupted"
    completion_timestamp: Optional[datetime] = None
    error: Optional[str] = None


class ThreadStateV1(BaseModel):
    version: Literal['v1']
    artifacts: list[Artifact]
    interactions: list[ThreadInteraction]


ThreadState = ThreadStateV1


class ThreadMetadata(BaseModel):
    thread_id: UUID
    title: str


class Thread(ThreadMetadata):
    state: ThreadState


def new_thread() -> Thread:
    return Thread(thread_id=uuid4(), title="", state=ThreadState(version="v1", artifacts=[], interactions=[]))
