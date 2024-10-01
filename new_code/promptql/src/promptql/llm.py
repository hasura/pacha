from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional
from dataclasses import dataclass, field
from typing import Any, Callable, Optional, Union

from pydantic import BaseModel, Field
from promptql.error import PromptQlException

import copy
import json

from promptql.logging import get_logger


class ToolOutput(BaseModel):
    output: str
    has_error: bool


class Tool(ABC):
    @abstractmethod
    def name(self) -> str:
        ...

    @abstractmethod
    def input_schema(self) -> dict[str, Any]:
        ...

    @abstractmethod
    def description(self) -> str:
        ...


class ToolCall(BaseModel):
    name: str
    call_id: str
    input: Any


class ToolCallResponse(BaseModel):
    call_id: str
    output: ToolOutput


class UserTurn(BaseModel):
    text: str


class AssistantTurn(BaseModel):
    text: Optional[str]
    tool_calls: list[ToolCall] = Field(default_factory=list)


class ToolResponseTurn(BaseModel):
    tool_responses: list[ToolCallResponse]


Turn = Union[UserTurn, AssistantTurn, ToolResponseTurn]


class ChatDelta(BaseModel):
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
        return sum(len(tool_response.output.output) for tool_response in turn.tool_responses)


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
            raise PromptQlException(
                "The latest user turn is beyond the character limit")

        if user_turn_index > 0:
            get_logger().info("Truncated first {user_turn_index} turns")

        # We always want to start the chat with a user turn.
        # TODO: Add summary of the truncated turns in the system prompt
        return Chat(system_prompt=self.system_prompt, turns=self.turns[user_turn_index:])


class LlmException(Exception):
    def __init__(self, message):
        super().__init__(message)


class Llm(ABC):
    @abstractmethod
    async def get_assistant_turn(self, chat: Chat, tools: list[Tool] = [], temperature: Optional[float] = None) -> AssistantTurn:
        ...

    async def ask(self, user_prompt: str, system_prompt: Optional[str] = None, temperature: Optional[float] = None) -> str:
        chat_obj = Chat(system_prompt)
        chat_obj.add_turn(UserTurn(text=user_prompt))
        response = (await self.get_assistant_turn(
            chat_obj, temperature=temperature)).text
        if response is None:
            raise LlmException("No LLM Response")
        return response
