from abc import ABC, abstractmethod
import asyncio
from dataclasses import dataclass
import datetime
from typing import Awaitable, Callable, Optional, override
from promptql_playground.artifacts import ThreadArtifactsProvider
from promptql_playground.config import PromptQlConfig
from promptql_playground.llm_chat import get_assistant_turn
from promptql_playground.thread import AssistantAction, CodeBlock, ThreadInteraction, ThreadState, UserConfirmation, UserConfirmationResponse, UserConfirmationResponseStatus, UserMessage
from promptql_playground import protocol
from promptql import PromptQlTool, PromptQl, PromptQlOutput, PromptQlError, PromptQlArtifactUpdate
from promptql.llm import Llm
from promptql.ai_primitives.classify import LlmClassifier
from promptql.ai_primitives.summarize import LlmSummarizer
from promptql.sql.ddn import DdnSqlEngine, DdnDataEngineException
from promptql.confirmation import ConfirmationProvider
from promptql.tool import CODE_ARGUMENT_NAME
from promptql.artifacts import Artifact
from promptql.error import PromptQlException
from uuid import uuid4
import os

from promptql_playground.thread import Thread


class InvalidClientInput(Exception):
    def __init__(self, message: str):
        super().__init__(message)


class InternalServerError(Exception):
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


async def no_op(*args, **kwargs):
    pass


async def run_thread(websocket: protocol.WebSocket,
                     thread: Optional[Thread],
                     config: PromptQlConfig,
                     update_handler: Callable[[Thread], Awaitable[None]] = no_op) -> int:
    interaction = None
    try:
        client_init = await websocket.recv()
        if not isinstance(client_init, protocol.ClientInit):
            raise InvalidClientInput(
                "Expected client_init as the first message")

        ddn_headers = config.ddn_headers.copy()
        if client_init.ddn_headers is not None:
            if thread is None:
                ddn_headers.update(client_init.ddn_headers)
            else:
                raise InvalidClientInput(
                    "Headers cannot be provided for existing threads")

        user_message = await websocket.recv()
        if not isinstance(user_message, protocol.UserMessage):
            raise InvalidClientInput("Expected user_message")

        title_updated: bool = False

        if thread is None:
            # TODO: Improve title generation
            title = user_message.message[:40]
            thread = Thread(thread_id=uuid4(), title=title, state=ThreadState(
                version="v1", artifacts=[], interactions=[]), ddn_headers=ddn_headers)
            title_updated = True

        thread_state = thread.state
        interaction = ThreadInteraction(interaction_id=uuid4(), user_message=UserMessage(
            timestamp=now(), message=user_message.message), assistant_actions=[])
        thread_state.interactions.append(interaction)
        await update_handler(thread)

        sql_engine = DdnSqlEngine(url=config.ddn_url, headers=ddn_headers)

        await websocket.send(protocol.AcceptInteraction(type='accept_interaction', interaction_id=interaction.interaction_id, thread_id=thread.thread_id))
        if title_updated:
            await websocket.send(protocol.TitleUpdated(type='title_updated', title=thread.title))

        catalog = await sql_engine.get_catalog()
        tool = PromptQlTool()

        while True:
            assistant_action_id = uuid4()

            await websocket.send(protocol.LlmCall(type='llm_call', assistant_action_id=assistant_action_id))

            assistant_turn = await get_assistant_turn(config.llm, thread_state, tool.system_prompt_fragment(
                thread_state.artifacts, catalog), tool)
            assistant_action = AssistantAction(
                action_id=assistant_action_id, response_start_timestamp=now(), message=assistant_turn.text, tokens_used=0)

            interaction.assistant_actions.append(assistant_action)

            await update_handler(thread)
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
                error = f'Missing tool input parameter: {
                    CODE_ARGUMENT_NAME}'
            else:
                code = tool_call.input[CODE_ARGUMENT_NAME]

            code_block = CodeBlock(code_block_id=uuid4(), code=code, error=error,
                                   execution_start_timestamp=now(), internal_tool_call=tool_call)
            assistant_action.code = code_block

            await update_handler(thread)

            await websocket.send(protocol.AssistantCodeResponse(type='assistant_code_response', assistant_action_id=assistant_action_id, code_block_id=code_block.code_block_id, code_chunk=code))

            await websocket.send(protocol.ExecutingCode(type='executing_code', code_block_id=code_block.code_block_id))

            if error is not None:
                assistant_action.action_end_timestamp = now()
                await update_handler(thread)
                await websocket.send(protocol.CodeError(type='code_error', code_block_id=code_block.code_block_id, error=error))
            else:
                code_block.output = ""
                promptql_client = PromptQl(
                    uri=config.promptql_uri,
                    api_token=config.promptql_secret_key,
                    sql_engine=sql_engine,
                    confirmation_provider=ClientConfirmationProvider(
                        code_block=code_block, websocket=websocket),
                    classifier=LlmClassifier(config.llm),
                    summarizer=LlmSummarizer(config.llm),
                    artifacts_provider=ThreadArtifactsProvider(
                        thread_state)
                )
                async for update in promptql_client.exec_code_streaming(code):
                    match update:
                        case PromptQlOutput():
                            code_block.output += update.output
                            await update_handler(thread)
                            await websocket.send(protocol.CodeOutput(type='code_output', code_block_id=code_block.code_block_id, output_chunk=update.output))
                        case PromptQlError():
                            code_block.error = update.error
                            await update_handler(thread)
                            await websocket.send(protocol.CodeError(type='code_error', code_block_id=code_block.code_block_id, error=update.error))
                            break
                        case PromptQlArtifactUpdate():
                            await update_handler(thread)
                            await websocket.send(protocol.ArtifactUpdate(type='artifact_update', artifact=update.artifact))
                code_block.execution_end_timestamp = now()
                assistant_action.action_end_timestamp = now()
                await update_handler(thread)

        interaction.completion_timestamp = now()
        await update_handler(thread)
        await websocket.send(protocol.ServerCompletion(type='completion'))
    except InvalidClientInput as e:
        if interaction is not None:
            interaction.error = str(e)
        if thread is not None:
            await update_handler(thread)
        await websocket.send(protocol.ClientError(type='client_error', message=str(e)))
        return 1003
    except (InternalServerError, PromptQlException) as e:
        if interaction is not None:
            interaction.error = str(e)
        if thread is not None:
            await update_handler(thread)
        await websocket.send(protocol.ServerError(type='server_error', message=str(e)))
        return 1011
    return 1000
