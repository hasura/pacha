from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, cast


class TurnType(Enum):
    SYSTEM = 0
    USER = 1
    ASSISTANT = 2


@dataclass
class Turn:
    type: TurnType
    text: str


@dataclass
class Chat:
    turns: list[Turn] = field(default_factory=list)

    def add_turn(self, turn: Turn):
        self.turns.append(turn)


class Llm(ABC):
    @abstractmethod
    def chat(self, chat: Chat, temperature=None) -> Turn:
        ...

    def ask(self, user_prompt: str, system_prompt: Optional[str] = None, temperature=None) -> str:
        chat_obj = Chat()

        if system_prompt is not None:
            chat_obj.add_turn(Turn(type=TurnType.SYSTEM, text=system_prompt))
        chat_obj.add_turn(Turn(type=TurnType.USER, text=user_prompt))
        return self.chat(chat_obj, temperature).text
