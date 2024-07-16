from dataclasses import dataclass
from typing import Optional
from pacha.utils.llm import UserTurn, AssistantTurn, Chat, Llm
from pacha.utils.llm.types import Chat, ToolCallResponse, ToolResponseTurn, UserTurn, Turn
from pacha.utils.logging import get_logger
from pacha.utils.tool import Tool, ToolOutput

from examples.utils.io import (
    get_python_executor_hooks_for_rendering_to_stdout, output, multi_line_input, Colors, get_query_planner_hooks_for_rendering_to_stdout,
    ASSISTANT_RESPONSE_COLOR, QUERY_PLAN_COLOR, USER_INPUT_COLOR
)

import json


SYSTEM_PROMPT_TEMPLATE = """
{instructions}

The user input may also contain some retrieved contextual data by an external system.
Use that data in your response if it seems relevant, but ignore it if not. Do not respond
as if the data came from the user.
If the retrieved data shows an error, do not mention the type or description of the error.
"""

USER_PROMPT_TEMPLATE = """
{user_query}

Retrieved contextual data:
```
{output}
```
"""

MAX_DATA_CONTEXT_LENGTH = 4000


@dataclass
class PachaChatResponse:
    # optional list of tool (input, output)
    tool_responses: Optional[list[tuple[str, ToolOutput]]]
    llm_response: str


@dataclass
class PachaChat:
    llm: Llm
    tools: list[Tool]
    chat: Chat
    pacha_tool: Tool

    def __init__(self,
                 llm: Llm,
                 system_prompt: Optional[str] = None,
                 tools: list[Tool] = [],
                 previous_messages: Optional[list[Turn]] = None):
        self.llm = llm
        self.tools = tools
        if system_prompt is None:
            system_prompt = "You are a helpful assistant."
        self.chat = Chat(
            system_prompt=SYSTEM_PROMPT_TEMPLATE.format(instructions=system_prompt))
        if previous_messages is not None:
            self.chat.turns = json.loads(previous_messages, object_hook = as_payload)
        self.pacha_tool = next(
            (t for t in tools if t.name() == "pacha"), None)

    def process_chat(self, user_query: str) -> PachaChatResponse:
        self.chat.add_turn(UserTurn(user_query))
        get_logger().info("Calling Assistant...")
        assistant_turn = self.llm.get_assistant_turn(
            self.chat, tools=self.tools, temperature=0)
        self.chat.add_turn(assistant_turn)
        tool_call_responses = []
        tool_input_output = []  # list of tool (input, output)
        if assistant_turn.text is not None:
            output("Assistant", ASSISTANT_RESPONSE_COLOR, assistant_turn.text)
        for tool_call in assistant_turn.tool_calls:
            if tool_call.name == self.pacha_tool.name():
                output("Pacha Input", QUERY_PLAN_COLOR, str(tool_call.input))
                tool_output = self.pacha_tool.execute(tool_call.input)
                output("Pacha Output", QUERY_PLAN_COLOR,
                       tool_output.get_response())
                tool_call_responses.append(ToolCallResponse(
                    call_id=tool_call.call_id, output=tool_output))
                tool_input_output.append((str(tool_call.input), tool_output))
            else:
                # TODO: handle non pacha tool call
                output("Error", Colors.RED, "Invalid tool call")
                raise Exception("Invalid tool call")

        if len(tool_call_responses) == 0:
            self.chat.add_turn(UserTurn(text=user_query))
        else:
            self.chat.add_turn(ToolResponseTurn(calls=tool_call_responses))

        assistant_turn = self.llm.get_assistant_turn(
            self.chat, tools=self.tools, temperature=0)
        self.chat.add_turn(assistant_turn)
        assert (assistant_turn.text is not None)
        return PachaChatResponse(tool_input_output, assistant_turn.text)
