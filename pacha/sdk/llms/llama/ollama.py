import ollama

from pacha.utils.logging import get_logger
from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, Chat
from pacha.sdk.llm import Llm, LlmException

LLAMA_MODEL_OLLAMA = "llama3:70b"


def to_message(turn: Turn) -> ollama.Message:
    if isinstance(turn, UserTurn):
        return ollama.Message(role="user", content=turn.text)
    elif isinstance(turn, AssistantTurn):
        if len(turn.tool_calls) != 0:
            raise LlmException("Llama does not support tool calls")
        assert (turn.text is not None)
        return ollama.Message(role="assistant", content=turn.text)
    raise TypeError("Invalid turn type")


class LlamaOnOLlama(Llm):
    def __init__(self, *args, **kwargs):
        self.client = ollama.Client(*args, **kwargs)

    def get_assistant_turn(self, chat: Chat, tools = [], temperature=None) -> AssistantTurn:
        assert(len(tools) == 0)
        messages = []
        system_prompt = chat.get_system_prompt()
        if system_prompt is not None:
            messages.append(ollama.Message(
                role='system', content=system_prompt))
        for turn in chat.turns:
            messages.append(to_message(turn))

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
