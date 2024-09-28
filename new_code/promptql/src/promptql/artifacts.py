from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Annotated, Any, Literal, Optional, Union, override
from pydantic import BaseModel, Field, field_validator

ArtifactType = Literal['text'] | Literal['table']
TableData = list[dict[str, Any]]
ArtifactData = str | TableData


class ArtifactBase(BaseModel):
    identifier: str
    title: str

    def render_for_prompt(self) -> str:
        return f"{self.get_type()} artifact: identifier = '{self.identifier}', title = '{self.title}', {self.render_data_for_prompt()}"

    @abstractmethod
    def render_data_for_prompt(self) -> str:
        ...

    @abstractmethod
    def get_type(self) -> ArtifactType:
        ...


class TextArtifact(ArtifactBase):
    artifact_type: Literal['text']
    data: str

    @override
    def render_data_for_prompt(self) -> str:
        return f"text_preview = '{self.data[:100]}'"

    @override
    def get_type(self) -> ArtifactType:
        return 'text'


NUM_SAMPLE_ROWS = 2


class TableArtifact(ArtifactBase):
    artifact_type: Literal['table']
    data: TableData

    @field_validator('data')
    def validate_data(cls, data: TableData):
        if not len(data) > 0:
            raise ValueError('table artifact must have at least one row')
        columns = set(data[0].keys())
        if not len(columns) > 0:
            raise ValueError('table artifact must have at least one column')
        return data

    @override
    def render_data_for_prompt(self) -> str:
        output = f"number of rows = {len(self.data)}"
        output += f", sample rows = {self.data[:NUM_SAMPLE_ROWS]}"
        return output

    @override
    def get_type(self) -> ArtifactType:
        return 'table'


Artifact = Annotated[Union[TextArtifact, TableArtifact],
                     Field(discriminator='artifact_type')]


class ArtifactValidationError(Exception):
    def __init__(self, message):
        super().__init__(message)


def construct_artifact(identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData) -> Artifact:
    raise ArtifactValidationError("not implemented")


class ArtifactsProvider(ABC):

    async def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData) -> Artifact:
        """Store an artifact"""
        if artifact_type == 'table':
            assert isinstance(data, list)
            artifact = TableArtifact(
                identifier=identifier, title=title, artifact_type=artifact_type, data=data)
        elif artifact_type == 'text':
            assert isinstance(data, str)
            artifact = TextArtifact(
                identifier=identifier, title=title, artifact_type=artifact_type, data=data)
        else:
            raise ValueError(f"Unknown artifact type {artifact_type}")
        await self.store_validated_artifact(artifact)
        return artifact

    @abstractmethod
    async def store_validated_artifact(self, artifact: Artifact):
        ...

    async def get_artifact_data(self, identifier: str) -> ArtifactData:
        """Get an artifact's data"""
        artifact = await self.get_artifact(identifier)
        return artifact.data

    @abstractmethod
    async def get_artifact(self, identifier: str) -> Artifact:
        """Get an artifact"""
        ...


@dataclass
class InMemoryArtifactsProvider(ArtifactsProvider):
    artifacts: dict[str, Artifact] = field(default_factory=dict)

    @override
    async def get_artifact(self, identifier: str) -> Artifact:
        artifact = self.artifacts.get(identifier)
        if artifact is None:
            raise KeyError(f"Unknown artifact {identifier}")
        return artifact

    @override
    async def store_validated_artifact(self, artifact: Artifact):
        self.artifacts[artifact.identifier] = artifact
