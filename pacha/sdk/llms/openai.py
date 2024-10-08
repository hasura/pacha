import openai
from openai.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionAssistantMessageParam,
    ChatCompletionMessageToolCallParam
)
import json
from typing import Optional
from pacha.utils.logging import get_logger
from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCall
from pacha.sdk.llm import Llm, LlmException
from pacha.sdk.tool import Tool

MODEL = "gpt-4-turbo"


def to_tool_call_param(tool_call: ToolCall) -> ChatCompletionMessageToolCallParam:
    return {
        "type": "function",
        "id": tool_call.call_id,
        "function": {
            "name": tool_call.name,
            "arguments": json.dumps(tool_call.input)
        }
    }


def to_messages(turn: Turn) -> list[ChatCompletionMessageParam]:
    if isinstance(turn, UserTurn):
        user_message: ChatCompletionUserMessageParam = {
            "role": "user",
            "content": turn.text,
        }
        return [user_message]
    elif isinstance(turn, AssistantTurn):
        assistant_message: ChatCompletionAssistantMessageParam = {
            "role": "assistant",
            "content": turn.text,
        }
        if len(turn.tool_calls) > 0:
            assistant_message["tool_calls"] = [to_tool_call_param(
                tool_call) for tool_call in turn.tool_calls]
        return [assistant_message]
    elif isinstance(turn, ToolResponseTurn):
        tool_messages = []
        for response in turn.tool_responses:
            tool_messages.append({
                "role": "tool",
                "tool_call_id": response.call_id,
                "content": response.output.get_response()
            })
        return tool_messages
    raise TypeError("Invalid turn type")


class OpenAI(Llm):
    def __init__(self, *args, **kwargs):
        self.client = openai.AsyncOpenAI(*args, **kwargs)

    async def get_assistant_turn(self, chat: Chat, tools: list[Tool] = [], temperature: Optional[float] = None) -> AssistantTurn:
        messages = []
        system_prompt = chat.get_system_prompt()
        if system_prompt is not None:
            system_message: ChatCompletionSystemMessageParam = {
                "role": "system",
                "content": system_prompt
            }
            messages.append(system_message)
        for turn in chat.turns:
            messages.extend(to_messages(turn))

        get_logger().debug(f"OpenAI Messages: {str(messages)}")

        try:
            response = await self.client.chat.completions.create(
                messages=messages,
                model=MODEL,
                temperature=temperature,
                tools=[{"type": "function", "function": {
                    "name": tool.name(),
                    "description": tool.description(),
                    "parameters": tool.input_schema()
                }} for tool in tools]
            )
        except Exception as e:
            get_logger().error(str(e))
            return AssistantTurn(text="Exception raised by LLM, check logs and try again?")
        else:
            get_logger().info(f"Token Usage: {response.usage}")

            message = response.choices[0].message
            tool_calls = []
            if message.tool_calls is not None:
                for tool_call in message.tool_calls:
                    tool_calls.append(ToolCall(
                        call_id=tool_call.id, name=tool_call.function.name, input=json.loads(tool_call.function.arguments)))

            return AssistantTurn(text=message.content, tool_calls=tool_calls)
