from together import Together
from together.types.chat_completions import ChatCompletionMessage, MessageRole, ChatCompletionResponse

from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, Chat
from pacha.sdk.llm import Llm, LlmException
from pacha.utils.logging import get_logger

LLAMA_MODEL_TOGETHER = "meta-llama/Llama-3-70b-chat-hf"


def to_message(turn: Turn) -> ChatCompletionMessage:
    if isinstance(turn, UserTurn):
        return ChatCompletionMessage(role=MessageRole.USER, content=turn.text)
    elif isinstance(turn, AssistantTurn):
        if len(turn.tool_calls) != 0:
            raise LlmException("Llama does not support tool calls")
        return ChatCompletionMessage(role=MessageRole.ASSISTANT, content=turn.text)
    raise TypeError("Invalid turn type")


class LlamaOnTogether(Llm):
    def __init__(self, *args, **kwargs):
        self.client = Together(*args, **kwargs)

    async def get_assistant_turn(self, chat: Chat, tools = [], temperature=None) -> AssistantTurn:
        assert(len(tools) == 0)
        messages = []
        system_prompt = chat.get_system_prompt()
        if system_prompt is not None:
            messages.append(ChatCompletionMessage(
                role=MessageRole.SYSTEM, content=system_prompt))
        messages.extend([to_message(turn).model_dump() for turn in chat.turns])
        get_logger().debug(f"Llama Messages: {messages}")
        response = self.client.chat.completions.create(
            model=LLAMA_MODEL_TOGETHER,
            messages=messages,
            temperature=temperature
        )
        assert (isinstance(response, ChatCompletionResponse))
        get_logger().info(f"Token Usage: {response.usage}")
        assert (response.choices is not None)
        assert (response.choices[0].message is not None)
        return AssistantTurn(text=response.choices[0].message.content)
