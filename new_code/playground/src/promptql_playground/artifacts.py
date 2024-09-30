from dataclasses import dataclass
from typing import override
from promptql_playground.thread import ThreadState
from promptql.artifacts import ArtifactsProvider, Artifact


@dataclass
class ThreadArtifactsProvider(ArtifactsProvider):
    thread: ThreadState

    @override
    async def get_artifact(self, identifier: str) -> Artifact:
        for artifact in self.thread.artifacts:
            if artifact.identifier == identifier:
                return artifact
        raise KeyError(f"Unknown artifact {identifier}")

    @override
    async def store_validated_artifact(self, artifact: Artifact):
        for i in range(len(self.thread.artifacts)):
            if artifact.identifier == self.thread.artifacts[i].identifier:
                self.thread.artifacts[i] = artifact
        self.thread.artifacts.append(artifact)
