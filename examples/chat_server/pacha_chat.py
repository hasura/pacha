from dataclasses import dataclass
from typing import Optional, TypedDict, cast, AsyncGenerator, Any
import uuid
from pacha.data_engine.artifacts import Artifacts
from pacha.data_engine.context import ExecutionContext
from pacha.data_engine.user_confirmations import UserConfirmationProvider, UserConfirmationResult
from pacha.sdk.chat import UserTurn, AssistantTurn, ToolResponseTurn, Chat, ToolCall, ToolCallResponse
from examples.chat_server.chat_json import ToolCallJson, ToolCallResponseJson
from pacha.sdk.llm import Llm
from pacha.sdk.tool import ErrorToolOutput, Tool, ToolOutput
from pacha.utils.logging import get_logger

import asyncio


@dataclass
class ChatFinish:
    tokens_used: Optional[str] = None


@dataclass
class UserConfirmationRequest:
    id: str
    message: str


AssistantEvents = AssistantTurn | ToolCallResponse | ToolResponseTurn | ChatFinish | UserConfirmationRequest


@dataclass
class PachaChat:
    llm: Llm
    pacha_tool: Tool
    chat: Chat
    artifacts: Artifacts
    confirmation_provider: UserConfirmationProvider

    def __init__(self,
                 llm: Llm,
                 pacha_tool: Tool,
                 system_prompt: str,
                 ):
        self.llm = llm
        self.pacha_tool = pacha_tool
        artifacts = Artifacts()
        self.artifacts = artifacts
        self.confirmation_provider = UserConfirmationProvider(event=asyncio.Event())

        def system_prompt_builder(turns): return f"""
            {system_prompt}

            {pacha_tool.system_prompt_fragment(artifacts)}."""

        self.chat = Chat(system_prompt=system_prompt_builder)

    async def process_chat_streaming(self, user_query: str) -> AsyncGenerator[AssistantEvents, None]:
        logger = get_logger()

        self.chat.add_turn(UserTurn(user_query))
        

        while True:
            assistant_turn = await self.llm.get_assistant_turn(self.chat, tools=[self.pacha_tool], temperature=0)
            self.chat.add_turn(assistant_turn)
            yield assistant_turn

            if not assistant_turn.tool_calls:
                break  # Exit the loop if there are no tool calls

            tool_call_responses = []
            for tool_call in assistant_turn.tool_calls:
                if tool_call.name == self.pacha_tool.name():
                    logger.debug('called pacha tool with input: %s',
                                 tool_call.input)
                    tool_execution_task = asyncio.create_task(self.pacha_tool.execute(
                        tool_call.input, ExecutionContext(self.artifacts, self.confirmation_provider)))

                    while True:
                        # Wait until either the tool execution is complete, or the tool requests a user confirmation
                        confirmation_request_task = asyncio.create_task(
                            self.confirmation_provider.event.wait())
                        done, pending = await asyncio.wait([tool_execution_task, confirmation_request_task], return_when=asyncio.FIRST_COMPLETED)
                        done_task = done.pop()
                        # If the tool is done, exit
                        if done_task == tool_execution_task:
                            break

                        # The tool requested a user confirmation, so yield a confirmation request event and continue waiting.
                        assert (done_task == confirmation_request_task)
                        confirmation_message = self.confirmation_provider.requested.message
                        confirmation_id = str(uuid.uuid4())
                        self.confirmation_provider.pending[confirmation_id] = self.confirmation_provider.requested
                        self.confirmation_provider.event.clear()
                        yield UserConfirmationRequest(confirmation_id, confirmation_message)

                    tool_output = tool_execution_task.result()
                    logger.debug('pacha tool output: %s', tool_output)
                    tool_call_response = ToolCallResponse(
                        call_id=tool_call.call_id, output=tool_output)
                    tool_call_responses.append(tool_call_response)
                    yield tool_call_response
                else:
                    error = f"""No such tool: {
                        tool_call.name}. Did you mean to call a Python/SQL function using the {self.pacha_tool.name()} tool instead?"""
                    tool_call_responses.append(ToolCallResponse(
                        call_id=tool_call.call_id, output=ErrorToolOutput(error)))

            tool_response_turn = ToolResponseTurn(
                tool_responses=tool_call_responses)
            self.chat.add_turn(tool_response_turn)
            yield tool_response_turn

        yield ChatFinish()  # TODO: Compute tokens and respond in finish message

    async def process_chat(self, user_query: str) -> list[AssistantTurn | ToolResponseTurn]:
        logger = get_logger()

        self.chat.add_turn(UserTurn(user_query))
        assistant_messages: list[AssistantTurn | ToolResponseTurn] = []

        while True:
            assistant_turn = await self.llm.get_assistant_turn(
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
                    tool_output = await self.pacha_tool.execute(
                        tool_call.input, ExecutionContext(self.artifacts))
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

    def handle_user_confirmation(self, confirmation_id: str, confirmed: bool):
        confirmation = self.confirmation_provider.pending.pop(confirmation_id, None)
        if confirmation is not None:
            confirmation.result = UserConfirmationResult.APPROVED if confirmed else UserConfirmationResult.DENIED
            confirmation.event.set()