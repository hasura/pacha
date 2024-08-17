from abc import ABC, abstractmethod
from dataclasses import dataclass, asdict
from typing import Any, Mapping, Optional

from pacha.data_engine.artifacts import Artifacts


@dataclass
class ToolOutput(ABC):
    @abstractmethod
    def get_response(self) -> str:
        ...

    @abstractmethod
    def get_error(self) -> Optional[str]:
        ...


class Tool(ABC):
    @abstractmethod
    def name(self) -> str:
        ...

    @abstractmethod
    def execute(self, input, artifacts: Artifacts) -> ToolOutput:
        ...

    @abstractmethod
    def input_schema(self) -> dict[str, Any]:
        ...

    @abstractmethod
    def description(self) -> str:
        ...

    @abstractmethod
    def system_prompt_fragment(self, artifacts: Artifacts) -> str:
        ...

    @abstractmethod
    def input_as_text(self, input) -> str:
        ...


@dataclass
class StringToolOutput(ToolOutput):
    response: str

    def get_response(self) -> str:
        return self.response

    def get_error(self) -> Optional[str]:
        return None

    def get_output_as_dict(self) -> dict:
        return asdict(self)