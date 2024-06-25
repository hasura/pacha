from typing import Optional
import openai
from openai.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionAssistantMessageParam
)

from pacha.utils.logging import get_logger
from pacha.utils.llm import Chat, Llm, Turn, TurnType

DEFAULT_MODEL = "gpt-3.5-turbo"


def to_message(turn: Turn) -> ChatCompletionMessageParam:
    match turn.type:
        case TurnType.SYSTEM:
            system_message: ChatCompletionSystemMessageParam = {
                "role": "system",
                "content": turn.text
            }
            return system_message
        case TurnType.ASSISTANT:
            assistant_message: ChatCompletionAssistantMessageParam = {
                "role": "assistant",
                "content": turn.text
            }
            return assistant_message
        case TurnType.USER:
            user_message: ChatCompletionUserMessageParam = {
                "role": "user",
                "content": turn.text
            }
            return user_message


class OpenAI(Llm):
    def __init__(self, *args, **kwargs):
        self.client = openai.OpenAI(*args, **kwargs)

    def chat(self, chat: Chat, temperature=None, model=DEFAULT_MODEL) -> Turn:
        messages = [to_message(turn) for turn in chat.turns]

        get_logger().debug(f"OpenAI Messages: {str(messages)}")

        response = self.client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=temperature
        )

        get_logger().info(f"Token Usage: {response.usage}")

        content = response.choices[0].message.content
        if content is None:
            raise RuntimeError("No response from OpenAI")
        return Turn(TurnType.ASSISTANT, content)
