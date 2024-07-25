from dataclasses import dataclass
from typing import Optional, TypedDict, cast
from pacha.utils.chat import UserTurn, ToolResponseTurn, Chat, ToolCallResponse
from pacha.sdk.tools import PythonToolOutput, PythonToolOutputJson, SqlToolOutput, SqlToolOutputJson
from pacha.utils.llm import Llm
from pacha.utils.tool import Tool, ToolOutput
from pacha.data_engine.data_engine import SqlOutput, SqlStatement

import logging


class PythonToolCallMessageJson(TypedDict):
    python_code: str
    output: PythonToolOutputJson


class SqlToolCallMessageJson(TypedDict):
    sql: str
    output: SqlToolOutputJson


ToolCallMessageJson = PythonToolCallMessageJson | SqlToolCallMessageJson


@dataclass
class ToolCallMessage:
    input: str
    output: ToolOutput

    def to_json(self) -> ToolCallMessageJson:
        output_dict = self.output.get_output_as_dict()
        if isinstance(self.output, PythonToolOutput):
            python_tool_output = cast(PythonToolOutputJson, output_dict)
            return PythonToolCallMessageJson(
                python_code=self.input,
                # Note: We explicitly construct the output json again for type hints
                output=PythonToolOutputJson(
                    output=python_tool_output["output"],
                    error=python_tool_output["error"],
                    sql_statements=python_tool_output["sql_statements"]
                )
            )
        elif isinstance(self.output, SqlToolOutput):
            sql_tool_output = cast(SqlToolOutputJson, output_dict)
            return SqlToolCallMessageJson(
                sql=self.input,
                # Note: We explicitly construct the output json again for type hints
                output=SqlToolOutputJson(
                    output=sql_tool_output["output"],
                    error=sql_tool_output["error"]
                )
            )
        else:
            raise TypeError("Unsupported ToolOutput type")


class AssistantMessageJson(TypedDict):
    text: Optional[str]
    tool_calls: list[ToolCallMessageJson]


@dataclass
class AssistantMessage:
    text: Optional[str]
    tool_calls: Optional[list[ToolCallMessage]]

    def to_json(self) -> AssistantMessageJson:
        tool_calls_json: list[ToolCallMessageJson]
        if self.tool_calls is None:
            tool_calls_json = []
        else:
            tool_calls_json = list(map(lambda m: m.to_json(), self.tool_calls))
        return {
            "text": self.text,
            "tool_calls": tool_calls_json
        }


@dataclass
class PachaChatResponse:
    assistant_messages: list[AssistantMessage]


@dataclass
class PachaChat:
    llm: Llm
    pacha_tool: Tool
    chat: Chat

    def __init__(self,
                 llm: Llm,
                 pacha_tool: Tool,
                 system_prompt: str,
                 ):
        self.llm = llm
        self.pacha_tool = pacha_tool
        self.chat = Chat(system_prompt=system_prompt)

    def process_chat(self, user_query: str) -> PachaChatResponse:
        # get flask's app.logger
        logger = logging.getLogger('examples.chat_server.server')
        self.chat.add_turn(UserTurn(user_query))
        response_messages = []  # list of all assistant turn texts and tool calls

        while True:
            assistant_turn = self.llm.get_assistant_turn(
                self.chat, tools=[self.pacha_tool], temperature=0)
            self.chat.add_turn(assistant_turn)

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_calls = []
            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug(
                        'called pacha tool with input: %s', tool_call.input)
                    tool_output = self.pacha_tool.execute(tool_call.input)
                    tool_calls.append(ToolCallMessage(
                        self.pacha_tool.input_as_text(tool_call.input), tool_output))
                    tool_call_responses.append(ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output))
                    logger.debug('pacha tool output: %s', tool_output)
                else:
                    raise Exception("Invalid tool call")

            self.chat.add_turn(ToolResponseTurn(calls=tool_call_responses))
            assistant_message = AssistantMessage(
                text=assistant_turn.text, tool_calls=tool_calls)
            response_messages.append(assistant_message)

        assert response_messages, "No response received"
        return PachaChatResponse(response_messages)
