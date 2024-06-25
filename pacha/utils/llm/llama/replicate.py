import replicate

from pacha.utils.logging import get_logger
from pacha.utils.llm import Turn, TurnType, Chat, Llm

LLAMA_MODEL_REPLICATE = "meta/meta-llama-3-70b-instruct"


def render_prompt_for_turn(turn: Turn, eot=True) -> str:
    prompt = f"<|start_header_id|>{turn.type.name.lower()}<|end_header_id|>\n\n{
        turn.text}"
    if eot:
        prompt += "<|eot_id|>"
    return prompt


def render_prompt_for_chat(chat: Chat) -> str:
    prompt = "<|begin_of_text|>"
    for turn in chat.turns[:-1]:
        prompt += render_prompt_for_turn(turn)
    ends_with_assistant = False
    if len(chat.turns) > 0:
        last_turn = chat.turns[-1]
        if last_turn.type == TurnType.ASSISTANT:
            ends_with_assistant = True
        prompt += render_prompt_for_turn(last_turn,
                                         eot=not ends_with_assistant)

    if not ends_with_assistant:
        prompt += "<|start_header_id|>assistant<|end_header_id|>\n\n"
    return prompt


class LlamaOnReplicate(Llm):
    def __init__(self, *args, **kwargs):
        self.client = replicate.Client(*args, **kwargs)

    def chat(self, chat: Chat, temperature=None) -> Turn:
        prompt = render_prompt_for_chat(chat)
        get_logger().debug(f"Llama Prompt: {prompt}")

        input = {
            "prompt": prompt,
        }

        if temperature is not None:
            input["temperature"] = temperature
        response = ''.join(self.client.run(LLAMA_MODEL_REPLICATE, input=input))
        return Turn(TurnType.ASSISTANT, response)
