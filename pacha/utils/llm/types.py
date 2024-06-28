from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional, cast, Union
import copy
from pacha.utils.tool import Tool, ToolOutput


@dataclass
class UserTurn:
    text: str


@dataclass
class ToolCall:
    name: str
    call_id: str
    input: Any


@dataclass
class AssistantTurn:
    text: Optional[str]
    tool_calls: list[ToolCall] = field(default_factory=list)


@dataclass
class ToolCallResponse:
    call_id: str
    output: ToolOutput


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


@dataclass
class LlmException(Exception):
    def __init__(self, message):
        super().__init__(message)


class Llm(ABC):
    @abstractmethod
    def get_assistant_turn(self, chat: Chat, tools: list[Tool] = [], temperature: Optional[float] = None) -> AssistantTurn:
        ...

    def ask(self, user_prompt: str, system_prompt: Optional[str] = None, temperature: Optional[float] = None) -> str:
        chat_obj = Chat(system_prompt)
        chat_obj.add_turn(UserTurn(text=user_prompt))
        response = self.get_assistant_turn(
            chat_obj, temperature=temperature).text
        if response is None:
            raise LlmException("No LLM Response")
        return response
