from dataclasses import dataclass, field
from typing import NotRequired, TypedDict, AsyncGenerator, Any, Optional, Dict
from pacha.data_engine.artifacts import ArtifactJson, Artifacts
from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse
from pacha.data_engine.user_confirmations import UserConfirmationResult
from pacha.sdk.tools import PythonToolOutput
from examples.chat_server.chat_json import (
    PachaTurnJson,
    UserConfirmationStatusJson,
    to_assistant_turn_json,
    to_tool_call_response_json,
    to_turn_json,
    to_user_confirmation_request_json
)
from pacha.utils.logging import get_logger
from examples.chat_server.pacha_chat import PachaChat, ChatFinish, UserConfirmationRequest
from examples.chat_server.db import (
    persist_turn,
    persist_turn_many,
    persist_artifacts,
    fetch_thread,
    fetch_turns,
    fetch_artifacts,
    fetch_user_confirmations,
    update_user_confirmation
)


import json
import aiosqlite
import asyncio


START_EVENT = 'start'
ASSISTANT_RESPONSE_EVENT = 'assistant_response'
TOOL_RESPONSE_EVENT = 'tool_response'
FINISH_EVENT = 'finish'
USER_CONFIRMATION_EVENT = 'user_confirmation'
ERROR_EVENT = 'error'


class ThreadMessageResponseJson(TypedDict):
    thread_id: str
    messages: list[PachaTurnJson]


class ThreadJson(TypedDict):
    thread_id: str
    title: Optional[str]
    history: NotRequired[list[PachaTurnJson]]
    artifacts: NotRequired[list[ArtifactJson]]
    user_confirmations: NotRequired[list[UserConfirmationStatusJson]]


@dataclass
class Thread:
    id: str
    title: Optional[str]
    chat: PachaChat
    db: aiosqlite.Connection
    user_confirmations: Dict[str, UserConfirmationResult] = field(
        default_factory=dict)

    async def send(self, message: str) -> list[Turn]:
        user_message = UserTurn(message)
        thread_messages: list[Turn] = [user_message]
        await persist_turn(self.db, self.id, user_message, self.chat.artifacts)

        assistant_messages = await self.chat.process_chat(message)
        thread_messages.extend(assistant_messages)
        await persist_turn_many(self.db, self.id, assistant_messages, self.chat.artifacts)
        await persist_artifacts(self.db, self.id, self.chat.artifacts.artifacts)

        return thread_messages

    async def send_streaming(self, message: str) -> AsyncGenerator[Any, None]:
        try:
            # if existing turns exist in conversation, verify initial state is correct
            if len(self.chat.chat.turns) > 0:
                assert(isinstance(self.chat.chat.turns[-1], AssistantTurn )), "Conversation must alternate between user and assistant, try a new thread"
            
            user_message = UserTurn(message)
            await persist_turn(self.db, self.id, user_message, self.chat.artifacts)

            start_event_data = json.dumps({"thread_id": self.id})
            yield render_event(START_EVENT, start_event_data)

            async for chunk in self.chat.process_chat_streaming(message):

                if isinstance(chunk, AssistantTurn):
                    await persist_turn(self.db, self.id, chunk, self.chat.artifacts)
                    event_data = json.dumps(to_assistant_turn_json(chunk))
                    yield render_event(ASSISTANT_RESPONSE_EVENT, event_data)

                elif isinstance(chunk, ToolCallResponse):
                    if isinstance(chunk.output, PythonToolOutput):
                        modified_artifacts = {identifier: self.chat.artifacts.artifacts[identifier]
                                              for identifier in chunk.output.modified_artifact_identifiers}
                        await persist_artifacts(self.db, self.id, modified_artifacts)
                    event_data = json.dumps(
                        to_tool_call_response_json(chunk, self.chat.artifacts))
                    yield render_event(TOOL_RESPONSE_EVENT, event_data)

                elif isinstance(chunk, ToolResponseTurn):
                    await persist_turn(self.db, self.id, chunk, self.chat.artifacts)

                elif isinstance(chunk, ChatFinish):
                    yield render_event(FINISH_EVENT, {})

                elif isinstance(chunk, UserConfirmationRequest):
                    await persist_turn(self.db, self.id, chunk, self.chat.artifacts)
                    event_data = json.dumps(
                        to_user_confirmation_request_json(chunk))
                    yield render_event(USER_CONFIRMATION_EVENT, event_data)

                else:
                    # handle unknown chunk types
                    event_data = json.dumps(
                        {"unknown_data": str(chunk)[0:40]})  # log max 40 chars
                    get_logger().warn(render_event("unknown", event_data))
                    
        except AssertionError as e:
            get_logger().error(str(e))
            yield render_event(ERROR_EVENT, {'error': str(e)})  
        except Exception as e:
            get_logger().error(str(e))
            yield render_event(ERROR_EVENT, {'error': 'Internal server error, check logs. Try a new thread maybe?'})  
                    
        finally:
            #persist any pending user confirmation requests as canceled or timed out
            for confirmation_id, request in self.chat.confirmation_provider.pending.items():
                if request.result == UserConfirmationResult.TIMED_OUT:
                    await update_user_confirmation(self.db, self.id, confirmation_id, UserConfirmationResult.TIMED_OUT)
                if request.result == UserConfirmationResult.PENDING:
                    await update_user_confirmation(self.db, self.id, confirmation_id, UserConfirmationResult.CANCELED)

    def to_json(self, include_history: bool = True) -> ThreadJson:
        json: ThreadJson = {
            "thread_id": self.id,
            "title": self.title
        }
        if include_history:
            json["history"] = [to_turn_json(turn,
                                            self.chat.artifacts) for turn in self.chat.turns]
            json["artifacts"] = [artifact.to_json()
                                 for artifact in self.chat.artifacts.artifacts.values()]
            json["user_confirmations"] = [{"confirmation_id": confirmation_id, "status": confirmation_status.name}
                                          for confirmation_id, confirmation_status in self.user_confirmations.items()]
        return json

    @classmethod
    async def from_db(cls, thread_id: str, default_chat: PachaChat, db: aiosqlite.Connection) -> 'Thread':
        thread = await fetch_thread(db, thread_id)
        if not thread:
            raise ThreadNotFound
        thread_id, title = thread['thread_id'], thread['title']
        pacha_turns = await fetch_turns(db, thread_id)
        artifacts = await fetch_artifacts(db, thread_id)
        user_confirmations = await fetch_user_confirmations(db, thread_id)
        chat = default_chat
        chat.turns = pacha_turns
        chat.chat.turns = [
            turn for turn in pacha_turns if isinstance(turn, Turn)]
        chat.artifacts = Artifacts(artifacts=artifacts)

        return cls(id=thread_id, title=title, chat=chat, db=db, user_confirmations=user_confirmations)


class ThreadNotFound(Exception):
    pass


def render_event(event_name, event_json_data) -> str:
    return f"event: {event_name}\ndata: {event_json_data}\n\n"
