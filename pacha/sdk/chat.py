from dataclasses import dataclass, field
from typing import Any, Callable, Optional, cast, Union, TypedDict
from pacha.error import PachaException
from pacha.sdk.tools.tool import ToolOutput
from pacha.sdk.tools import PythonToolOutputJson, SqlToolOutputJson, PythonToolOutput, SqlToolOutput

import copy
import json

# ToolCall and ToolCallResponse are here instead of pacha/sdk/tools/tool.py intentionally.
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
    input: Any

    def to_json(self) -> ToolCallJson:
        return ToolCallJson(
            name=self.name,
            call_id=self.call_id,
            input=self.input
        )


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
        return AssistantTurnJson(
            text=self.text,
            tool_calls=list(map(lambda m: m.to_json(), self.tool_calls))
        )


class ToolResponseTurnJson(TypedDict):
    tool_responses: list[ToolCallResponseJson]


@dataclass
class ToolResponseTurn:
    tool_responses: list[ToolCallResponse]

    def to_json(self) -> ToolResponseTurnJson:
        return ToolResponseTurnJson(
            tool_responses=list(
                map(lambda m: m.to_json(), self.tool_responses))
        )


Turn = Union[UserTurn, AssistantTurn, ToolResponseTurn]


@dataclass
class ChatDelta:
    turns: list[Union[AssistantTurn, ToolResponseTurn]]


def get_prompt_characters(turn: Turn) -> int:
    if isinstance(turn, UserTurn):
        return len(turn.text)
    if isinstance(turn, AssistantTurn):
        characters = 0
        if turn.text is not None:
            characters += len(turn.text)
        for tool_call in turn.tool_calls:
            characters += len(tool_call.name)
            characters += len(json.dumps(tool_call.input))
        return characters
    if isinstance(turn, ToolResponseTurn):
        return sum(len(tool_response.output.get_response()) for tool_response in turn.tool_responses)


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

    def truncate(self, character_limit: int) -> 'Chat':
        index = len(self.turns) - 1
        characters = 0
        system_prompt = self.get_system_prompt()
        if system_prompt is not None:
            characters += len(system_prompt)
        user_turn_index = None
        while index >= 0:
            turn_characters = get_prompt_characters(self.turns[index])
            if characters + turn_characters > character_limit:
                break
            characters += turn_characters
            if isinstance(self.turns[index], UserTurn):
                user_turn_index = index
            index -= 1
        if user_turn_index is None:
            raise PachaException("The latest user turn is beyond the character limit")
        
        # We always want to start the chat with a user turn.
        # TODO: Add summary of the truncated turns in the system prompt
        return Chat(system_prompt=self.system_prompt, turns=self.turns[user_turn_index:])