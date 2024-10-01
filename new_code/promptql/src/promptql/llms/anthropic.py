from typing import Optional
import anthropic
from anthropic.types import Message, MessageParam, ToolParam
from promptql.logging import get_logger
from promptql.llm import Turn, UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCall, Llm, Tool

MODEL = "claude-3-5-sonnet-20240620"
MAX_TOKENS = 1024


def to_message(turn: Turn) -> MessageParam:
    if isinstance(turn, UserTurn):
        user_message: MessageParam = {
            "role": "user",
            "content": [{"type": "text", "text": turn.text}],
        }
        return user_message
    elif isinstance(turn, AssistantTurn):
        content = []
        if turn.text is not None:
            content.append({
                "type": "text",
                "text": turn.text
            })
        for tool_call in turn.tool_calls:
            content.append({
                "type": "tool_use",
                "name": tool_call.name,
                "id": tool_call.call_id,
                "input": tool_call.input
            })
        return {
            "role": "assistant",
            "content": content
        }
    elif isinstance(turn, ToolResponseTurn):
        content = []
        for response in turn.tool_responses:
            content.append({
                "type": "tool_result",
                "tool_use_id": response.call_id,
                "content": [{"type": "text", "text": response.output.output}],
                "is_error": response.output.has_error
            })
        return {
            "role": "user",
            "content": content
        }
    raise TypeError("Invalid turn type")


class Anthropic(Llm):
    def __init__(self, model=MODEL, *args, **kwargs):
        self.model = model
        self.client = anthropic.AsyncAnthropic(*args, **kwargs)

    async def get_assistant_turn(self, chat: Chat, tools: list[Tool] = [], temperature: Optional[float] = None) -> AssistantTurn:
        messages = [to_message(turn) for turn in chat.turns]
        system_prompt = chat.get_system_prompt()

        get_logger().debug(f"Anthropic System Prompt: {
            system_prompt}\nMessages: {str(messages)}")

        raw_response = await self.client.messages.with_raw_response.create(
            max_tokens=MAX_TOKENS,
            messages=messages,
            model=MODEL,
            temperature=temperature if temperature is not None else anthropic.NotGiven(),
            system=system_prompt if system_prompt is not None else anthropic.NotGiven(),
            tools=[{
                "name": tool.name(),
                "description": tool.description(),
                "input_schema": tool.input_schema()
            } for tool in tools])

        # print(raw_response.headers)
        response: Message = raw_response.parse()

        get_logger().info(f"Token Usage: {response.usage}")

        text = None
        tool_calls = []
        for content in response.content:
            if content.type == "text":
                assert (text is None)
                text = content.text
            elif content.type == "tool_use":
                tool_calls.append(ToolCall(name=content.name,
                                           call_id=content.id, input=content.input))
        return AssistantTurn(text=text, tool_calls=tool_calls)
