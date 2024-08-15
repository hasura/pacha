
from dataclasses import dataclass, field
from typing import Any, Literal

ArtifactType = Literal['table', 'text']
ArtifactData = list[dict[str, Any]] | str

NUM_SAMPLE_ROWS = 2

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

@dataclass
class Artifacts:
    # Map of artifact identifier to artifact
    artifacts: dict[str, Artifact] = field(default_factory=dict)

    def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData) -> str:
        
        artifact = Artifact(
            identifier=identifier, title=title, artifact_type=artifact_type, data=data)
        self.artifacts[identifier] = artifact
        return f"Stored {artifact.render_for_prompt()}"

    def get_artifact(self, identifier: str) -> ArtifactData:
        # Should we deep copy the data before returning?
        return self.artifacts[identifier].data
    
    def render_for_prompt(self) -> str:
        rendered = ""
        for artifact in self.artifacts.values():
            rendered += f"{artifact.render_for_prompt()}\n\n"
        return rendered