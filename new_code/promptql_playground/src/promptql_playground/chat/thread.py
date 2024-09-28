from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from promptql.artifacts import Artifact
from promptql.sql import SqlStatement
from promptql.llm import ToolCall
from pydantic import BaseModel, Field
from uuid import UUID


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
    action_end_timestamp: Optional[datetime] = None # If this is None, it means there was an error
    tokens_used: int


class UserMessage(BaseModel):
    timestamp: datetime
    message: str


class ThreadInteraction(BaseModel):
    interaction_id: UUID
    user_message: UserMessage
    assistant_actions: list[AssistantAction]
    completion_timestamp: Optional[datetime] = None  # If this is None and error is None, it means UX should render something like "Assistant interrupted"
    error: Optional[str] = None


class ThreadStateV1(BaseModel):
    version: Literal['v1']
    artifacts: list[Artifact]
    interactions: list[ThreadInteraction]


ThreadState = ThreadStateV1

"""
{
  "version": "v1",
  "artifacts": [
    {
      "identifier": "artifact_123",
      "title": "User data table",
      "artifact_type": "table",
      "data": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
      ]
    }
  ],
  "interactions": [
    {
      "user_message": {
        "timestamp": "2024-09-23T12:34:56Z",
        "message": "What is the user data?"
      },
      "assistant_actions": [
        {
          "response_start_timestamp": "2024-09-23T12:35:00Z",
          "message": "Fetching user data...",
          "code": {
            "code": "executor.print(executor.run_sql("SELECT * FROM users"))",
            "execution_start_timestamp": "2024-09-23T12:35:02Z",
            "execution_end_timestamp": "2024-09-23T12:35:03Z",
            "output": "[{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]"
          }
        },
        {
          "response_start_timestamp": "2024-09-23T12:35:05Z",
          "message": "Here is the data\n<artifact identifier = 'artifact_123' />"
        }
      ],
      "complete": true
    }
  ]
}

{
  "version": "v1",
  "artifacts": [
    {
      "identifier": "artifact_123",
      "title": "User data table",
      "artifact_type": "table",
      "data": [
        { "id": 1, "name": "Alice" },
        { "id": 2, "name": "Bob" }
      ]
    }
  ],
  "interactions": [
    {
      "user_message": {
        "timestamp": "2024-09-23T12:34:56Z",
        "message": "What is the user data?"
      },
      "assistant_actions": [
        {
          "response_start_timestamp": "2024-09-23T12:35:00Z",
          "message": "Fetching user data...",
          "error": "missing parameter python_code",
          tokens_used: 1504
        },
        {
          "response_start_timestamp": "2024-09-23T12:39:00Z",
          "message": "oops trying again...",
          "code": {
            "code": "executor.store_artifact(executor.run_sql("SELECT * FROM users"))",
            "execution_start_timestamp": "2024-09-23T12:35:02Z",
            "execution_end_timestamp": "2024-09-23T12:35:03Z",
            "output": "SQL run successfully"
            "error": "invalid store_artifact call"
          },
          tokens_used: 1564
        },
        {
          "response_start_timestamp": "2024-09-23T12:45:00Z",
          "message": "apologies, storing the artifact properly...",
          "code": {
            "code": "executor.store_artifact('artifact_123', executor.run_sql("SELECT * FROM users"))",
            "execution_start_timestamp": "2024-09-23T12:35:02Z",
            "execution_end_timestamp": "2024-09-23T12:35:03Z",
            "output": "SQL run successfully\nArtifact stored successfully"
          },
          tokens_used: 1634
        },
        {
          "response_start_timestamp": "2024-09-23T12:47:00Z",
          "message": "here is your data: <artifact identifier='artifact_123' />",
          tokens_used: 1753
        }
      ],
      "complete": true
    },
    {
        "user_message": {
            "timestamp": "2024-09-23T12:58:56Z",
            "message": "thank you"
        },
        "assistant_actions": [],
        "complete": false, # server crashed
    },
    {
        "user_message": {
            "timestamp": "2024-09-23T12:59:56Z",
            "message": "i said thank you"
        },
        "assistant_actions": [{
            "response_start_timestamp": "2024-09-23T12:59:00Z",
            "message": "you're welcome",
            tokens_used: 1812
        }],
        "complete": true,
    },
  ],
}
"""
