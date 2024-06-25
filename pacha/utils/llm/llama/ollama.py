import ollama

from pacha.utils.logging import get_logger
from pacha.utils.llm import Turn, TurnType, Chat, Llm

LLAMA_MODEL_OLLAMA = "llama3:70b"


def to_message_role(turn_type: TurnType):
    match turn_type:
        case TurnType.SYSTEM:
            return "system"
        case TurnType.ASSISTANT:
            return "assistant"
        case TurnType.USER:
            return "user"


def to_message(turn: Turn) -> ollama.Message:
    return ollama.Message(role=to_message_role(turn.type), content=turn.text)


class LlamaOnOLlama(Llm):
    def __init__(self, *args, **kwargs):
        self.client = ollama.Client(*args, **kwargs)

    def chat(self, chat: Chat, temperature=None) -> Turn:
        messages = [to_message(turn) for turn in chat.turns]
        get_logger().debug(f"Llama Messages: {messages}")

        options: ollama.Options = {}
        if temperature is not None:
            options["temperature"] = temperature

        response = self.client.chat(
            model=LLAMA_MODEL_OLLAMA,
            messages=messages,
            options=options
        )
        text = response["message"]["content"]  # type: ignore
        return Turn(TurnType.ASSISTANT, text)  # type: ignore
