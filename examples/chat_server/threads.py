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
    from_turn_json,
    to_turn_json,
    from_artifact_json)
from pacha.utils.logging import get_logger
from examples.chat_server.pacha_chat import PachaChat, ChatFinish, UserConfirmationRequest


import json
import aiosqlite


START_EVENT = 'start'
ASSISTANT_RESPONSE_EVENT = 'assistant_response_message'
TOOL_RESPONSE_EVENT = 'tool_response_message'
FINISH_EVENT = 'finish'
USER_CONFIRMATION_EVENT = 'user_confirmation'


class ThreadMessageJson(TypedDict):
    messages: list[TurnJson]


class ThreadCreateResponseJson(TypedDict):
    thread_id: str
    response: NotRequired[ThreadMessageJson]


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
class ThreadMessage:
    messages: list[Turn]

    def to_json(self, artifacts: Artifacts) -> ThreadMessageJson:
        return {
            "messages": list(map(lambda m:
                                 to_user_turn_json(m) if isinstance(m, UserTurn)
                                 else to_assistant_turn_json(m) if isinstance(m, AssistantTurn)
                                 else to_tool_response_turn_json(m, artifacts), self.messages))
        }


@dataclass
class Thread:
    id: str
    chat: PachaChat
    db: aiosqlite.Connection

    async def send(self, message: str) -> ThreadMessage:
        user_message = UserTurn(message)
        thread_messages: list[Turn] = [user_message]

        await self.db.execute('''INSERT INTO turns (thread_id, message)
                                    VALUES (?, ?);''', (self.id, json.dumps(to_user_turn_json(user_message))))
        assistant_messages = await self.chat.process_chat(message)
        thread_messages.extend(assistant_messages)
        params = [{'message': json.dumps(to_turn_json(
            msg, self.chat.artifacts))} for msg in assistant_messages]
        await self.db.executemany(f'''INSERT INTO turns (thread_id, message)
                                    VALUES  ('{self.id}', :message);''', params)
        
        artifacts = [{'artifact_id': artifact_id, 'artifact_json' :json.dumps(artifact.to_json())}
                                 for artifact_id, artifact in self.chat.artifacts.artifacts.items()]
        await self.db.executemany(f'''INSERT INTO artifacts (thread_id, artifact_id, artifact_json)
                                  VALUES ('{self.id}', :artifact_id, :artifact_json);''', artifacts)
        return ThreadMessage(thread_messages)

    async def send_streaming(self, message: str) -> AsyncGenerator[Any, None]:
        try:
            user_message = UserTurn(message)
            await self.db.execute(f'''INSERT INTO turns (thread_id, message)
                                    VALUES (?, ?);''', (self.id, json.dumps(to_user_turn_json(user_message))))

            start_event_data = json.dumps({"thread_id": self.id})
            yield render_event(START_EVENT, start_event_data)

            async for chunk in self.chat.process_chat_streaming(message):

                if isinstance(chunk, AssistantTurn):
                    await self.db.execute(f'''INSERT INTO turns (thread_id, message)
                                        VALUES (?, ?);''', (self.id, json.dumps(to_assistant_turn_json(chunk))))
                    event_data = json.dumps(to_assistant_turn_json(chunk))
                    yield render_event(ASSISTANT_RESPONSE_EVENT, event_data)

                elif isinstance(chunk, ToolCallResponse):
                    event_data = json.dumps(
                        to_tool_call_response_json(chunk, self.chat.artifacts))
                    yield render_event(TOOL_RESPONSE_EVENT, event_data)

                elif isinstance(chunk, ToolResponseTurn):
                    await self.db.execute(f'''INSERT INTO turns (thread_id, message)
                                       VALUES (?,?);''', (self.id, json.dumps(to_tool_response_turn_json(chunk, self.chat.artifacts))))

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
            
            artifacts = [{'artifact_id': artifact_id, 'artifact_json' :json.dumps(artifact.to_json())}
                                 for artifact_id, artifact in self.chat.artifacts.artifacts.items()]
            await self.db.executemany(f'''INSERT INTO artifacts (thread_id, artifact_id, artifact_json)
                                  VALUES ('{self.id}', :artifact_id, :artifact_json);''', artifacts)    
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
        try:
            cursor = await db.execute("SELECT 1 from threads where thread_id = ?", (thread_id,))
            thread = await cursor.fetchone()

            if not thread:
                await cursor.close()
                raise ThreadNotFound

            cursor = await db.execute(
                "SELECT message FROM turns WHERE thread_id = ? ORDER BY turn_id", (thread_id,))
            turn_rows = await cursor.fetchall()
            await cursor.close()
        except aiosqlite.DatabaseError as e:
            get_logger().error(f"Database error occurred: {e}")
            raise
        turns: list[Turn] = []
        for turn_row in turn_rows:
            turn = from_turn_json(turn_row[0])
            turns.append(turn)

        # Handle artifacts
        try:
            cursor = await db.execute(
                "SELECT artifact_json FROM artifacts WHERE thread_id = ? order by id", (thread_id,))
            artifact_rows = await cursor.fetchall()
            artifacts: dict[str, Artifact] = {}
            for artifact_row in artifact_rows:
                artifact = from_artifact_json(artifact_row[0])
                artifacts[artifact.identifier] = artifact
        except aiosqlite.DatabaseError as e:
            get_logger().error(f"Database error occurred: {e}")
            raise

        chat = default_chat
        chat.chat.turns = turns
        chat.artifacts = Artifacts(artifacts=artifacts)
        return cls(id=thread_id, chat=chat, db=db)


class ThreadNotFound(Exception):
    pass


def render_event(event_name, event_json_data) -> str:
    return f"event: {event_name}\ndata: {event_json_data}\n\n"
