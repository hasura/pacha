from dataclasses import dataclass
from typing import Optional
from pacha.utils.chat import UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCallResponse
from pacha.utils.llm import Llm
from pacha.utils.logging import get_logger
from pacha.utils.tool import Tool, ToolOutput


@dataclass
class ToolCallMessage:
    input: str
    output: ToolOutput


@dataclass
class AssistantMessage:
    text: Optional[str]
    tool_calls: Optional[list[ToolCallMessage]]


@dataclass
class PachaChatResponse:
    response_messages: list[AssistantMessage]


@dataclass
class PachaChat:
    llm: Llm
    pacha_tool: Tool
    chat: Chat
    tools: list[Tool]

    def __init__(self,
                 llm: Llm,
                 pacha_tool: Tool,
                 system_prompt: Optional[str] = None,
                 ):
        self.llm = llm
        self.pacha_tool = pacha_tool
        if system_prompt is None:
            system_prompt = "You are a helpful assistant."
        self.chat = Chat(
            system_prompt=system_prompt)
        self.tools = [self.pacha_tool]

    def process_chat(self, user_query: str) -> PachaChatResponse:
        self.chat.add_turn(UserTurn(user_query))
        response_messages = []  # list of all assistant turn texts and tool calls

        while True:
            assistant_turn = self.llm.get_assistant_turn(
                self.chat, tools=self.tools, temperature=0)
            self.chat.add_turn(assistant_turn)

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_calls = []
            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    tool_output = self.pacha_tool.execute(tool_call.input)
                    tool_calls.append(ToolCallMessage(
                        str(tool_call.input), tool_output))
                    tool_call_responses.append(ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output))
                else:
                    raise Exception("Invalid tool call")

            self.chat.add_turn(ToolResponseTurn(calls=tool_call_responses))
            assistant_message = AssistantMessage(text=assistant_turn.text, tool_calls=tool_calls)
            response_messages.append(assistant_message)

        assert response_messages, "No response received"
        return PachaChatResponse(response_messages)
