from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Optional, cast, Union
import copy
from pacha.utils.tool import Tool, ToolOutput
import json


@dataclass
class UserTurn:
    text: str
    type: str = 'user_turn'


@dataclass
class ToolCall:
    name: str
    call_id: str
    input: Any

  
@dataclass
class AssistantTurn:
    text: Optional[str]
    tool_calls: list[ToolCall] = field(default_factory=list)
    type: str = 'assistant_turn'


@dataclass
class ToolCallResponse:
    call_id: str
    output: PythonToolOutput
    
    def from_dict(self, tool_call_response_dict: dict):
        match tool_call_response_dict.get('type'):
            case 'code':
                pass
            case 'sql':
                pass
            case _:
                raise Exception('unknown tool output type')
        
    

@dataclass
class ToolResponseTurn:
    calls: list[ToolCallResponse]
    type: str = 'tool_response_turn'
    

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

    def add_turn_from_dict(self, turn_dict: dict) -> Turn:
        match turn_dict.get('type'):
            case 'user_turn':
                return UserTurn(**turn_dict)
            case 'assistant_turn':
                # TODO: Use pydantic to avoid explicitly marshalling nested classes
                tool_calls = [ToolCall(**tool_call) for tool_call in turn_dict.get('tool_calls', [])]
    
                return AssistantTurn(
                    text=turn_dict.get('text'),
                    tool_calls=tool_calls
                )
            case 'tool_response_turn':
                # TODO: Use pydantic to avoid explicitly marshalling nested classes
                calls = [ToolCallResponse.from_dict(**call) for call in turn_dict.get('calls', [])]
 
                return ToolResponseTurn(**turn_dict)
            case _:
                raise Exception("Invalid turn")

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
