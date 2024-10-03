from typing import Annotated, Any, Literal, Union
from pydantic import BaseModel, Field

from promptql.artifacts import ArtifactData, ArtifactType
from promptql.sql.engine import SqlOutput


class HelloMessage(BaseModel):
    python: str


class PrintMessage(BaseModel):
    type: Literal["print"]
    text: str


class ErrorMessage(BaseModel):
    type: Literal["error"]
    message: str


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


ServerMessage = Annotated[Union[
    PrintMessage,
    ErrorMessage,
    StoreArtifactMessage,
    GetArtifactMessage,
    ClassifyMessage,
    SummarizeMessage,
    RunSQLMessage
], Field(discriminator='type')]
