
from dataclasses import asdict, dataclass, field
from typing import Any, Literal, TypedDict, cast, Tuple

ArtifactType = Literal['table', 'text']
ArtifactData = list[dict[str, Any]] | str

NUM_SAMPLE_ROWS = 2


class ArtifactJson(TypedDict):
    identifier: str
    title: str
    artifact_type: ArtifactType
    data: ArtifactData


@dataclass
class Artifact:
    identifier: str
    title: str
    artifact_type: ArtifactType
    data: ArtifactData

    def render_for_prompt(self) -> str:
        output = f"{self.artifact_type} artifact: identifier = '{
            self.identifier}', title = '{self.title}'"
        if self.artifact_type == 'text':
            assert (isinstance(self.data, str))
            output += f", text_preview = '{self.data[:100]}'"
        elif self.artifact_type == 'table':
            assert (isinstance(self.data, list) and len(self.data) > 0)
            assert (isinstance(self.data[0], dict))
            output += f", number of rows = {len(self.data)}"
            output += f", sample rows = {self.data[:NUM_SAMPLE_ROWS]}"
        else:
            raise ValueError(f'Invalid artifact type {self.artifact_type}')
        return output

    def to_json(self) -> ArtifactJson:
        return cast(ArtifactJson, asdict(self))

    def get_validation_error(self) -> str | None:
        if self.artifact_type == 'text':
            if not isinstance(self.data, str):
                return "Text artifact should have text data"
        elif self.artifact_type == 'table':
            if not isinstance(self.data, list):
                return "Table artifact should have a list of rows"
            if len(self.data) == 0:
                return "Table artifact should have at least 1 row"
            if not isinstance(self.data[0], dict):
                return "Table artifact rows should be a map of columns"
        else:
            return f"Unknown artifact type {self.artifact_type}"
        return None


@dataclass
class Artifacts:
    # Map of artifact identifier to artifact
    artifacts: dict[str, Artifact] = field(default_factory=dict)

    def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData) -> Tuple[str, bool]:

        artifact = Artifact(
            identifier=identifier, title=title, artifact_type=artifact_type, data=data)
        validation_error = artifact.get_validation_error()
        if validation_error is not None:
            return (f"Invalid artifact {identifier} not stored: {validation_error}", False)

        rendered = artifact.render_for_prompt()
        self.artifacts[identifier] = artifact
        return (f"Stored {rendered}", True)

    def get_artifact(self, identifier: str) -> ArtifactData:
        return self.artifacts[identifier].data

    def render_for_prompt(self) -> str:
        rendered = ""
        for artifact in self.artifacts.values():
            rendered += f"{artifact.render_for_prompt()}\n\n"
        return rendered
