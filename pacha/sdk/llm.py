from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional

from pacha.sdk.chat import Chat, UserTurn, AssistantTurn
from pacha.sdk.tool import Tool


@dataclass
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
