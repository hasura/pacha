from dataclasses import dataclass, field
from typing import NotRequired, Optional, TypedDict, AsyncGenerator, Any
from pacha.data_engine.artifacts import ArtifactJson, Artifacts, Artifact
from pacha.sdk.chat import Turn, UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse
from examples.chat_server.chat_json import (
    TurnJson,
    to_assistant_turn_json,
    to_tool_call_response_json,
    to_tool_response_turn_json,
    to_user_turn_json,
    to_turn_json,
    from_turn_json,
    from_artifact_json)
from pacha.utils.logging import get_logger
from examples.chat_server.pacha_chat import PachaChat, ChatFinish, UserConfirmationRequest
from examples.chat_server.db import persist_turn, persist_turn_many, persist_artifacts, fetch_thread_id, fetch_turns, fetch_artifacts


import json
import aiosqlite


START_EVENT = 'start'
ASSISTANT_RESPONSE_EVENT = 'assistant_response_message'
TOOL_RESPONSE_EVENT = 'tool_response_message'
FINISH_EVENT = 'finish'
USER_CONFIRMATION_EVENT = 'user_confirmation'


class ThreadMessageResponseJson(TypedDict):
    thread_id: str
    messages: list[TurnJson]


class ThreadJson(TypedDict):
    thread_id: str
    history: NotRequired[list[TurnJson]]
    artifacts: NotRequired[list[ArtifactJson]]


class UserConfirmationRequestJson(TypedDict):
    thread_id: str
    confirmation_id: str
    message: str


def to_user_confirmation_request_json(request: UserConfirmationRequest, thread_id: str) -> UserConfirmationRequestJson:
    return {
        "confirmation_id": request.id,
        "message": request.message,
        "thread_id": thread_id
    }

@dataclass
class Thread:
    id: str
    chat: PachaChat
    db: aiosqlite.Connection

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
                    event_data = json.dumps(
                        to_tool_call_response_json(chunk, self.chat.artifacts))
                    yield render_event(TOOL_RESPONSE_EVENT, event_data)

                elif isinstance(chunk, ToolResponseTurn):
                    await persist_turn(self.db, self.id, chunk, self.chat.artifacts)

                elif isinstance(chunk, ChatFinish):
                    yield render_event(FINISH_EVENT, {})

                elif isinstance(chunk, UserConfirmationRequest):
                    event_data = json.dumps(
                        to_user_confirmation_request_json(chunk, self.id))
                    yield render_event(USER_CONFIRMATION_EVENT, event_data)

                else:
                    # handle unknown chunk types
                    event_data = json.dumps(
                        {"unknown_data": str(chunk)[0:40]})  # log max 40 chars
                    get_logger().warn(render_event("unknown", event_data))

            await persist_artifacts(self.db, self.id, self.chat.artifacts.artifacts)
        finally:
            await self.db.close()

    def to_json(self, include_history: bool = True) -> ThreadJson:
        json: ThreadJson = {
            "thread_id": self.id
        }
        if include_history:
            json["history"] = [to_turn_json(turn,
                                            self.chat.artifacts) for turn in self.chat.chat.turns]
            json["artifacts"] = [artifact.to_json()
                                 for artifact in self.chat.artifacts.artifacts.values()]
        return json

    @classmethod
    async def from_db(cls, thread_id: str, default_chat: PachaChat, db: aiosqlite.Connection) -> 'Thread':
        thread = await fetch_thread_id(db, thread_id)
        if not thread:
            raise ThreadNotFound

        turns = await fetch_turns(db, thread_id)
        artifacts = await fetch_artifacts(db, thread_id)
        chat = default_chat
        chat.chat.turns = turns
        chat.artifacts = Artifacts(artifacts=artifacts)
        return cls(id=thread_id, chat=chat, db=db)


class ThreadNotFound(Exception):
    pass


def render_event(event_name, event_json_data) -> str:
    return f"event: {event_name}\ndata: {event_json_data}\n\n"
