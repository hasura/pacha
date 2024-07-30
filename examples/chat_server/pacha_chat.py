from dataclasses import dataclass
from typing import Optional, TypedDict, cast, AsyncGenerator, Any
from pacha.sdk.chat import UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCall, ToolCallResponse, ToolCallJson, ToolCallResponseJson
from pacha.sdk.llms.llm import Llm
from pacha.sdk.tools.tool import Tool, ToolOutput

import asyncio
import logging


# class PythonToolCallMessageJson(TypedDict):
#     python_code: str
#     output: PythonToolOutputJson


# class SqlToolCallMessageJson(TypedDict):
#     sql: str
#     output: SqlToolOutputJson


class ToolCallMessageJson(TypedDict):
    tool_call: ToolCallJson
    tool_call_response: ToolCallResponseJson


@dataclass
class ToolCallMessage:
    tool_call: ToolCall
    tool_call_response: ToolCallResponse

    def to_json(self) -> ToolCallMessageJson:
        return {
            "tool_call": self.tool_call.to_json(),
            "tool_call_response": self.tool_call_response.to_json()
        }
        # output_dict = self.output.get_output_as_dict()
        # if isinstance(self.output, PythonToolOutput):
        #     python_tool_output = cast(PythonToolOutputJson, output_dict)
        #     return PythonToolCallMessageJson(
        #         python_code=self.input,
        #         # Note: We explicitly construct the output json again for type hints
        #         output=PythonToolOutputJson(
        #             output=python_tool_output["output"],
        #             error=python_tool_output["error"],
        #             sql_statements=python_tool_output["sql_statements"]
        #         )
        #     )
        # elif isinstance(self.output, SqlToolOutput):
        #     sql_tool_output = cast(SqlToolOutputJson, output_dict)
        #     return SqlToolCallMessageJson(
        #         sql=self.input,
        #         # Note: We explicitly construct the output json again for type hints
        #         output=SqlToolOutputJson(
        #             output=sql_tool_output["output"],
        #             error=sql_tool_output["error"]
        #         )
        #     )
        # else:
        #     raise TypeError("Unsupported ToolOutput type")


# class AssistantMessageJson(TypedDict):
#     text: Optional[str]
#     tool_calls: list[ToolCallMessageJson]


# @dataclass
# class AssistantMessage:
#     text: Optional[str]
#     tool_calls: Optional[list[ToolCallMessage]]

#     def to_json(self) -> AssistantMessageJson:
#         tool_calls_json: list[ToolCallMessageJson]
#         if self.tool_calls is None:
#             tool_calls_json = []
#         else:
#             tool_calls_json = list(map(lambda m: m.to_json(), self.tool_calls))
#         return {
#             "text": self.text,
#             "tool_calls": tool_calls_json
#         }


@dataclass
class ChatFinishMessage:
    tokens_used: Optional[str] = None


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

    async def process_chat_streaming(self, user_query: str) -> AsyncGenerator[Any, None]:
        # get flask's app.logger
        logger = logging.getLogger('examples.chat_server.server')
        self.chat.add_turn(UserTurn(user_query))
        assistant_messages = []  # list of all assistant turn texts and tool calls

        while True:
            assistant_turn = await asyncio.to_thread(
                self.llm.get_assistant_turn,
                self.chat,
                tools=[self.pacha_tool],
                temperature=0
            )
            self.chat.add_turn(assistant_turn)
            assistant_messages.append(assistant_turn)

            yield assistant_turn

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_call_messages: list[ToolCallMessage] = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug('called pacha tool with input: %s',
                                 tool_call.input)
                    tool_output = await asyncio.to_thread(self.pacha_tool.execute, tool_call.input)
                    logger.debug('pacha tool output: %s', tool_output)
                    tool_call_response = ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output)
                    tool_call_message = ToolCallMessage(
                        tool_call=tool_call,
                        tool_call_response=tool_call_response
                    )
                    tool_call_messages.append(tool_call_message)
                    yield tool_call_response
                else:
                    raise Exception("Invalid tool call")
            
            tool_response_turn =  ToolResponseTurn(responses=list(map(lambda m : m.tool_call_response, tool_call_messages)))
            self.chat.add_turn(tool_response_turn)
            assistant_messages.append(tool_response_turn)

        yield ChatFinishMessage()  # TODO: Compute tokens and respond
        assert assistant_messages, "No response received"
        yield assistant_messages

    def process_chat(self, user_query: str) -> list[AssistantTurn | ToolResponseTurn]:
        # get flask's app.logger
        logger = logging.getLogger('examples.chat_server.server')
        self.chat.add_turn(UserTurn(user_query))
        assistant_messages = []  # list of all assistant turn texts and tool calls

        while True:
            assistant_turn = self.llm.get_assistant_turn(
                self.chat, tools=[self.pacha_tool], temperature=0)
            self.chat.add_turn(assistant_turn)
            assistant_messages.append(assistant_turn)

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_calls = []
            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug(
                        'called pacha tool with input: %s', tool_call.input)
                    tool_output = self.pacha_tool.execute(tool_call.input)
                    tool_call_response = ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output)
                    tool_calls.append(ToolCallMessage(
                        tool_call=tool_call,
                        tool_call_response=tool_call_response))
                    tool_call_responses.append(tool_call_response)
                    logger.debug('pacha tool output: %s', tool_output)
                else:
                    raise Exception("Invalid tool call")

            tool_response_turn =  ToolResponseTurn(responses=tool_call_responses)
            self.chat.add_turn(tool_response_turn)
            assistant_messages.append(tool_response_turn)

        assert assistant_messages, "No response received"
        return assistant_messages
