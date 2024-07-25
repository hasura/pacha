from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional, cast, Union
import copy
from pacha.utils.tool import ToolOutput


# ToolCall and ToolCallResponse are here instead of pacha/utils/tool.py intentionally.
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
    calls: list[ToolCallResponse]


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
