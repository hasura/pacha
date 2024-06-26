import abc
from dataclasses import dataclass
from typing import Any

class ToolOutput(abc.ABC):
    def get_response(self) -> str:
        ...

    def get_error(self) -> str:
        ...

class Tool(abc.ABC):
    def execute(self, input) -> ToolOutput:
        ...

    def input_schema(self) -> dict[str, Any]:
        ...

    def description(self) -> str:
        ...

    def system_prompt_fragment(self, tool_name: str) -> str:
        ...


@dataclass
class StringToolOutput(ToolOutput):
    response: str

    def get_response(self) -> str:
        return self.response