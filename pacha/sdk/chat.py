from dataclasses import dataclass, field
from typing import Any, Callable, Optional, cast, Union, TypedDict
from pacha.sdk.tools.tool import ToolOutput
from pacha.sdk.tools import PythonToolOutputJson, SqlToolOutputJson, PythonToolOutput, SqlToolOutput

import copy

# ToolCall and ToolCallResponse are here instead of pacha/utils/tool.py intentionally.
# Tool calls are less about the tool and more about the chat itself
# (i.e. tool calls with IDs always happen in the context of a chat)


class ToolCallJson(TypedDict):
    name: str
    call_id: str
    input: dict


@dataclass
class ToolCall:
    name: str
    call_id: str
    input: object

    def to_json(self) -> ToolCallJson:
        return {
            "name": self.name,
            "call_id": self.call_id,
            "input": vars(self.input)
        }


ToolOutputJson = PythonToolOutputJson | SqlToolOutputJson


class ToolCallResponseJson(TypedDict):
    call_id: str
    output: ToolOutputJson


@dataclass
class ToolCallResponse:
    call_id: str
    output: ToolOutput

    def to_json(self) -> ToolCallResponseJson:
        output_dict = self.output.get_output_as_dict()
        if isinstance(self.output, PythonToolOutput):
            python_tool_output = cast(PythonToolOutputJson, output_dict)
            return ToolCallResponseJson(
                call_id=self.call_id,
                # Note: We explicitly construct the output json again for type hints
                output=PythonToolOutputJson(
                    output=python_tool_output["output"],
                    error=python_tool_output["error"],
                    sql_statements=python_tool_output["sql_statements"]
                )
            )
        elif isinstance(self.output, SqlToolOutput):
            sql_tool_output = cast(SqlToolOutputJson, output_dict)
            return ToolCallResponseJson(
                call_id=self.call_id,
                # Note: We explicitly construct the output json again for type hints
                output=SqlToolOutputJson(
                    output=sql_tool_output["output"],
                    error=sql_tool_output["error"]
                )
            )
        else:
            raise TypeError("Unsupported ToolOutput type")


@dataclass
class UserTurn:
    text: str


class AssistantTurnJson(TypedDict):
    text: Optional[str]
    tool_calls: list[ToolCallJson]


@dataclass
class AssistantTurn:
    text: Optional[str]
    tool_calls: list[ToolCall] = field(default_factory=list)

    def to_json(self) -> AssistantTurnJson:
        return {
            "text": self.text,
            "tool_calls": list(map(lambda m: m.to_json(), self.tool_calls))

        }


class ToolResponseTurnJson(TypedDict):
    responses: list[ToolCallResponseJson]


@dataclass
class ToolResponseTurn:
    responses: list[ToolCallResponse]

    def to_json(self):
        return {
            "responses": list(map(lambda m: m.to_json, self.responses))
        }


Turn = Union[UserTurn, AssistantTurn, ToolResponseTurn]


@dataclass
class ChatDelta:
    turns: list[Union[AssistantTurn, ToolResponseTurn]]


@dataclass
class Chat:
    system_prompt: Union[None, str, Callable[[list[Turn]], str]]
    turns: list[Turn] = field(default_factory=list)

    def add_turn(self, turn: Turn):
        self.turns.append(turn)

    def extend(self, delta: ChatDelta):
        self.turns.extend(delta.turns)

    def get_system_prompt(self) -> Optional[str]:
        if self.system_prompt is None:
            return None
        if isinstance(self.system_prompt, str):
            return self.system_prompt
        return self.system_prompt(self.turns)

    def with_delta(self, delta: ChatDelta) -> 'Chat':
        chat = copy.copy(self)
        chat.turns = list(self.turns)
        chat.extend(delta)
        return chat
