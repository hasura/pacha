from dataclasses import dataclass
from typing import Optional, TypedDict, cast, AsyncGenerator, Any
from pacha.data_engine.artifacts import Artifacts
from pacha.sdk.chat import UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCall, ToolCallResponse, ToolCallJson, ToolCallResponseJson
from pacha.sdk.llms.llm import Llm
from pacha.sdk.tools.tool import Tool, ToolOutput
from pacha.utils.logging import get_logger

import asyncio


@dataclass
class ChatFinish:
    tokens_used: Optional[str] = None


AssistantEvents = AssistantTurn | ToolCallResponse | ToolResponseTurn | ChatFinish


@dataclass
class PachaChat:
    llm: Llm
    pacha_tool: Tool
    chat: Chat
    artifacts: Artifacts

    def __init__(self,
                 llm: Llm,
                 pacha_tool: Tool,
                 system_prompt: str,
                 ):
        self.llm = llm
        self.pacha_tool = pacha_tool
        artifacts = Artifacts()
        self.artifacts = artifacts

        def system_prompt_builder(turns): return f"""
            {system_prompt}

            {pacha_tool.system_prompt_fragment(artifacts)}."""

        self.chat = Chat(system_prompt=system_prompt_builder)

    async def process_chat_streaming(self, user_query: str) -> AsyncGenerator[AssistantEvents, None]:
        logger = get_logger()

        self.chat.add_turn(UserTurn(user_query))

        while True:
            assistant_turn = await asyncio.to_thread(
                self.llm.get_assistant_turn,
                self.chat,
                tools=[self.pacha_tool],
                temperature=0
            )
            self.chat.add_turn(assistant_turn)
            yield assistant_turn

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug('called pacha tool with input: %s',
                                 tool_call.input)
                    tool_output = await asyncio.to_thread(self.pacha_tool.execute, tool_call.input, self.artifacts)
                    logger.debug('pacha tool output: %s', tool_output)
                    tool_call_response = ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output)
                    tool_call_responses.append(tool_call_response)
                    yield tool_call_response
                else:
                    raise Exception("Invalid tool call")

            tool_response_turn = ToolResponseTurn(
                tool_responses=tool_call_responses)
            self.chat.add_turn(tool_response_turn)
            yield tool_response_turn

        yield ChatFinish()  # TODO: Compute tokens and respond in finish message

    def process_chat(self, user_query: str) -> list[AssistantTurn | ToolResponseTurn]:
        logger = get_logger()

        self.chat.add_turn(UserTurn(user_query))
        assistant_messages: list[AssistantTurn | ToolResponseTurn] = []

        while True:
            assistant_turn = self.llm.get_assistant_turn(
                self.chat, tools=[self.pacha_tool], temperature=0)
            self.chat.add_turn(assistant_turn)
            assistant_messages.append(assistant_turn)

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug(
                        'called pacha tool with input: %s', tool_call.input)
                    tool_output = self.pacha_tool.execute(
                        tool_call.input, self.artifacts)
                    tool_call_response = ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output)
                    tool_call_responses.append(tool_call_response)
                    logger.debug('pacha tool output: %s', tool_output)
                else:
                    raise Exception("Invalid tool call")

            tool_response_turn = ToolResponseTurn(
                tool_responses=tool_call_responses)
            self.chat.add_turn(tool_response_turn)
            assistant_messages.append(tool_response_turn)

        assert assistant_messages, "No response received"
        return assistant_messages
