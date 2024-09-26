from typing import Annotated, Any, Literal, Union
from pydantic import BaseModel, Field


class ArtifactBase(BaseModel):
    identifier: str
    title: str


class TextArtifact(ArtifactBase):
    artifact_type: Literal['text']
    data: str


class TableArtifact(ArtifactBase):
    artifact_type: Literal['table']
    data: list[dict[str, Any]]


Artifact = Annotated[Union[TextArtifact, TableArtifact],
                     Field(discriminator='artifact_type')]
