from typing import Any, Literal, Union
from pydantic import BaseModel, Field


class TextArtifact(BaseModel):
    artifact_type: Literal['text']
    data: str


class TableArtifact(BaseModel):
    artifact_type: Literal['table']
    data: list[dict[str, Any]]


class Artifact(BaseModel):
    identifier: str
    title: str
    content: Union[TextArtifact, TableArtifact] = Field(
        discriminator="artifact_type")
