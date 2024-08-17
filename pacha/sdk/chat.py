from dataclasses import dataclass, field
from typing import Any, Callable, Optional, Union
from pacha.error import PachaException
from pacha.sdk.tool import ToolOutput

import copy
import json

from pacha.utils.logging import get_logger

# ToolCall and ToolCallResponse are here instead of pacha/sdk/tools/tool.py intentionally.
# Tool calls are less about the tool and more about the chat itself
# (i.e. tool calls with IDs always happen in the context of a chat)


@dataclass
class ToolCall:
    name: str
    call_id: str
    input: Any


@dataclass
class ToolCallResponse:
    call_id: str
    output: ToolOutput


@dataclass
class UserTurn:
    text: str

@dataclass
class AssistantTurn:
    text: Optional[str]
    tool_calls: list[ToolCall] = field(default_factory=list)


@dataclass
class ToolResponseTurn:
    tool_responses: list[ToolCallResponse]


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
        
        if user_turn_index > 0:
            get_logger().info("Truncated first {user_turn_index} turns")

        # We always want to start the chat with a user turn.
        # TODO: Add summary of the truncated turns in the system prompt
        return Chat(system_prompt=self.system_prompt, turns=self.turns[user_turn_index:])