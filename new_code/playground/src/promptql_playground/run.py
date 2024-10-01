from abc import ABC, abstractmethod
import asyncio
from dataclasses import dataclass
import datetime
from typing import Optional, override
from promptql_playground.artifacts import ThreadArtifactsProvider
from promptql_playground.llm_chat import get_assistant_turn
from promptql_playground.thread import AssistantAction, CodeBlock, ThreadInteraction, ThreadState, UserConfirmation, UserConfirmationResponse, UserConfirmationResponseStatus, UserMessage
from promptql_playground import protocol
from promptql import PromptQlTool, PromptQl, PromptQlOutput, PromptQlError, PromptQlArtifactUpdate
from promptql.llm import Llm
from promptql.ai_primitives.classify import LlmClassifier
from promptql.ai_primitives.summarize import LlmSummarizer
from promptql.sql import SqlEngine
from promptql.confirmation import ConfirmationProvider
from promptql.tool import CODE_ARGUMENT_NAME
from promptql.artifacts import Artifact
from uuid import uuid4
import os

from promptql_playground.thread import Thread


class ThreadUpdateHandler(ABC):
    async def on_update(self, thread: Thread):
        pass


class InvalidClientInput(Exception):
    def __init__(self, message: str):
        super().__init__(message)


def now():
    return datetime.datetime.now()


CONFIRMATION_TIMEOUT_SECS = 60


@dataclass
class ClientConfirmationProvider(ConfirmationProvider):
    code_block: CodeBlock
    websocket: protocol.WebSocket

    @override
    async def request_confirmation(self, sql: str) -> bool:
        confirmation_request_id = uuid4()
        user_confirmation = UserConfirmation(
            confirmation_request_id=confirmation_request_id, request_timestamp=now(), message=sql)
        self.code_block.user_confirmations.append(user_confirmation)
        await self.websocket.send(protocol.UserConfirmationRequest(type='user_confirmation_request', message=sql, confirmation_request_id=confirmation_request_id))
        try:
            response = await asyncio.wait_for(self.websocket.recv(), CONFIRMATION_TIMEOUT_SECS)
        except TimeoutError:
            user_confirmation.response = UserConfirmationResponse(
                timestamp=now(), status=UserConfirmationResponseStatus.timeout)
            await self.websocket.send(protocol.UserConfirmationTimeout(type='user_confirmation_timeout', confirmation_request_id=confirmation_request_id))
            return False

        if not isinstance(response, protocol.UserConfirmationResponse):
            raise InvalidClientInput("expected UserConfirmationResponse")

        if response.confirmation_request_id != confirmation_request_id:
            raise InvalidClientInput("invalid confirmation_request_id")

        user_confirmation.response = UserConfirmationResponse(
            timestamp=now(), status=UserConfirmationResponseStatus(response.response))

        return response.response == 'approve'


async def run_thread(websocket: protocol.WebSocket,
                     thread: Thread,
                     llm: Llm,
                     sql_engine: SqlEngine,
                     update_handler: ThreadUpdateHandler = ThreadUpdateHandler()):

    client_init = await websocket.recv()
    if not isinstance(client_init, protocol.ClientInit):
        raise InvalidClientInput("Expected client_init as the first message")
    user_message = await websocket.recv()
    if not isinstance(user_message, protocol.UserMessage):
        raise InvalidClientInput("Expected user_message")

    if thread.title == "":
        # TODO: Improve title generation
        thread.title = user_message.message[:40]
        await websocket.send(protocol.TitleUpdated(type='title_updated', title=thread.title))

    thread_state = thread.state
    interaction = ThreadInteraction(interaction_id=uuid4(), user_message=UserMessage(
        timestamp=now(), message=user_message.message), assistant_actions=[])
    thread_state.interactions.append(interaction)
    await update_handler.on_update(thread)

    await websocket.send(protocol.AcceptInteraction(type='accept_interaction', interaction_id=interaction.interaction_id, thread_id=thread.thread_id))

    catalog = await sql_engine.get_catalog()
    tool = PromptQlTool()

    while True:
        assistant_action_id = uuid4()

        await websocket.send(protocol.LlmCall(type='llm_call', assistant_action_id=assistant_action_id))

        assistant_turn = await get_assistant_turn(llm, thread_state, tool.system_prompt_fragment(
            thread_state.artifacts, catalog), tool)
        assistant_action = AssistantAction(
            action_id=assistant_action_id, response_start_timestamp=now(), message=assistant_turn.text, tokens_used=0)

        interaction.assistant_actions.append(assistant_action)

        await update_handler.on_update(thread)
        if assistant_action.message is not None:
            await websocket.send(protocol.AssistantMessageResponse(type='assistant_message_response', assistant_action_id=assistant_action_id, message_chunk=assistant_action.message))

        if len(assistant_turn.tool_calls) == 0:
            break

        assert (len(assistant_turn.tool_calls) == 1)
        tool_call = assistant_turn.tool_calls[0]
        error = None
        code = ""
        if tool_call.name != tool.name():
            error = f'Invalid tool name {tool_call.name}'
        elif not isinstance(tool_call.input, dict):
            error = f'Invalid tool input, expected dictionary'
        elif tool_call.input.get(CODE_ARGUMENT_NAME) is None:
            error = f'Missing tool input parameter: {CODE_ARGUMENT_NAME}'
        else:
            code = tool_call.input[CODE_ARGUMENT_NAME]

        code_block = CodeBlock(code_block_id=uuid4(), code=code, error=error,
                               execution_start_timestamp=now(), internal_tool_call=tool_call)
        assistant_action.code = code_block

        await update_handler.on_update(thread)

        await websocket.send(protocol.AssistantCodeResponse(type='assistant_code_response', assistant_action_id=assistant_action_id, code_block_id=code_block.code_block_id, code_chunk=code))

        await websocket.send(protocol.ExecutingCode(type='executing_code', code_block_id=code_block.code_block_id))

        if error is not None:
            assistant_action.action_end_timestamp = now()
            await update_handler.on_update(thread)
            await websocket.send(protocol.CodeError(type='code_error', code_block_id=code_block.code_block_id, error=error))
        else:
            code_block.output = ""
            promptql_client = PromptQl(
                uri=os.environ.get("PROMPTQL_URI", "ws://localhost:3001"),
                api_token=os.environ.get("PROMPTQL_SECRET_KEY", None),
                sql_engine=sql_engine,
                confirmation_provider=ClientConfirmationProvider(
                    code_block=code_block, websocket=websocket),
                classifier=LlmClassifier(llm),
                summarizer=LlmSummarizer(llm),
                artifacts_provider=ThreadArtifactsProvider(thread_state)
            )
            async for update in promptql_client.exec_code_streaming(code):
                match update:
                    case PromptQlOutput():
                        code_block.output += update.output
                        await update_handler.on_update(thread)
                        await websocket.send(protocol.CodeOutput(type='code_output', code_block_id=code_block.code_block_id, output_chunk=update.output))
                    case PromptQlError():
                        code_block.error = update.error
                        await update_handler.on_update(thread)
                        await websocket.send(protocol.CodeError(type='code_error', code_block_id=code_block.code_block_id, error=update.error))
                        break
                    case PromptQlArtifactUpdate():
                        await update_handler.on_update(thread)
                        await websocket.send(protocol.ArtifactUpdate(type='artifact_update', artifact=update.artifact))
            code_block.execution_end_timestamp = now()
            assistant_action.action_end_timestamp = now()
            await update_handler.on_update(thread)

    interaction.completion_timestamp = now()
    await update_handler.on_update(thread)

    await websocket.send(protocol.ServerCompletion(type='completion'))
    # print(thread.model_dump_json(indent=4))
