from together import Together
from together.types.chat_completions import ChatCompletionMessage, MessageRole

from pacha.utils.logging import get_logger
from pacha.utils.llm import Turn, TurnType, Chat, Llm

LLAMA_MODEL_TOGETHER = "meta-llama/Llama-3-70b-chat-hf"


def to_message_role(turn_type: TurnType):
    match turn_type:
        case TurnType.SYSTEM:
            return MessageRole.SYSTEM
        case TurnType.ASSISTANT:
            return MessageRole.ASSISTANT
        case TurnType.USER:
            return MessageRole.USER


def to_message(turn: Turn) -> ChatCompletionMessage:
    return ChatCompletionMessage(role=to_message_role(turn.type), content=turn.text)


class LlamaOnTogether(Llm):
    def __init__(self, *args, **kwargs):
        self.client = Together(*args, **kwargs)

    def chat(self, chat: Chat, temperature=None) -> Turn:
        messages = [to_message(turn).model_dump() for turn in chat.turns]
        get_logger().debug(f"Llama Messages: {messages}")
        response = self.client.chat.completions.create(
            model=LLAMA_MODEL_TOGETHER,
            messages=messages,
            temperature=temperature
        )
        get_logger().info(f"Token Usage: {response.usage}")  # type: ignore
        text = response.choices[0].message.content  # type: ignore
        return Turn(TurnType.ASSISTANT, text)  # type: ignore
