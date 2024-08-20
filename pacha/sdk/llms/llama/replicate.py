import replicate

from pacha.utils.logging import get_logger
from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, Chat
from pacha.sdk.llm import Llm, LlmException

LLAMA_MODEL_REPLICATE = "meta/meta-llama-3-70b-instruct"


def render_prompt(turn_type: str, text: str, eot=True) -> str:
    prompt = f"<|start_header_id|>{turn_type}<|end_header_id|>\n\n{
        text}"
    if eot:
        prompt += "<|eot_id|>"
    return prompt


def render_prompt_for_turn(turn: Turn, eot=True) -> str:
    if isinstance(turn, UserTurn):
        return render_prompt(turn_type="user", text=turn.text)
    elif isinstance(turn, AssistantTurn):
        if len(turn.tool_calls) != 0:
            raise LlmException("Llama does not support tool calls")
        assert (turn.text is not None)
        return render_prompt(turn_type="assistant", text=turn.text)
    raise TypeError("Invalid turn type")


def render_prompt_for_chat(chat: Chat) -> str:
    prompt = "<|begin_of_text|>"
    system_prompt = chat.get_system_prompt()
    if system_prompt is not None:
        prompt += render_prompt(turn_type="system", text=system_prompt)
    for turn in chat.turns[:-1]:
        prompt += render_prompt_for_turn(turn)

    ends_with_assistant = False
    if len(chat.turns) > 0:
        last_turn = chat.turns[-1]
        if isinstance(last_turn, AssistantTurn):
            ends_with_assistant = True
        prompt += render_prompt_for_turn(last_turn,
                                         eot=not ends_with_assistant)

    if not ends_with_assistant:
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
    return prompt


class LlamaOnReplicate(Llm):
    def __init__(self, *args, **kwargs):
        self.client = replicate.Client(*args, **kwargs)

    async def get_assistant_turn(self, chat: Chat, tools = [], temperature=None) -> AssistantTurn:
        assert(len(tools) == 0)
        prompt = render_prompt_for_chat(chat)
        get_logger().debug(f"Llama Prompt: {prompt}")

        input = {
            "prompt": prompt,
        }

        if temperature is not None:
            input["temperature"] = str(temperature)
        return AssistantTurn(text=''.join(self.client.run(LLAMA_MODEL_REPLICATE, input=input)))
