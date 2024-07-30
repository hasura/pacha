from dataclasses import dataclass, field
from typing import NotRequired, Optional, TypedDict, AsyncGenerator, Any
from pacha.sdk.chat import UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse, AssistantTurnJson, ToolResponseTurnJson
from examples.chat_server.pacha_chat import PachaChat, ChatFinishMessage

import json


class ThreadMessageJson(TypedDict):
    user_message: str
    assistant_messages: list[AssistantTurnJson | ToolResponseTurnJson]


class ThreadCreateResponseJson(TypedDict):
    thread_id: str
    response: NotRequired[ThreadMessageJson]


class ThreadJson(TypedDict):
    thread_id: str
    history: NotRequired[list[ThreadMessageJson]]


@dataclass
class ThreadMessage:
    user_message: UserTurn
    assistant_messages: list[AssistantTurn | ToolResponseTurn]

    def to_json(self) -> ThreadMessageJson:
        return {
            "user_message": self.user_message.text,
            "assistant_messages": list(map(lambda m: m.to_json(), self.assistant_messages))
        }


@dataclass
class Thread:
    id: str
    chat: PachaChat
    history: list[ThreadMessage] = field(default_factory=list)

    def send(self, message: str) -> ThreadMessage:
        assistant_messages= self.chat.process_chat(message)
        thread_message = ThreadMessage(UserTurn(message), assistant_messages)
        self.history.append(thread_message)
        return thread_message

    async def send_streaming(self, message: str) -> AsyncGenerator[Any, None]:

        current_message = ThreadMessage(
            user_message=UserTurn(message), assistant_messages=[])

        yield f"event: start\ndata: {{}}\n\n"

        async for chunk in self.chat.process_chat_streaming(message):
            print(f"Received chunk: {chunk}")  # Debug print

            if isinstance(chunk, AssistantTurn):
                current_message.assistant_messages.append(chunk)
                event_data = json.dumps(chunk.to_json())
                yield f"event: assistant_message\ndata: {event_data}\n\n"

            elif isinstance(chunk, ToolCallResponse):
                event_data = json.dumps(chunk.to_json())
                yield f"event: tool_call_message\ndata: {event_data}\n\n"

            elif isinstance(chunk, ChatFinishMessage):
                self.history.append(current_message)
                yield f"event: finish\ndata: {{}}\n\n"

            elif isinstance(chunk, ToolResponseTurn):
                current_message.assistant_messages.append(chunk)

            else:
                # Handle unknown chunk types
                event_data = json.dumps({"unknown_data": str(chunk)})
                yield f"event: unknown\ndata: {event_data}\n\n"

    def to_json(self, include_history: bool = True) -> ThreadJson:
        json: ThreadJson = {
            "thread_id": self.id
        }
        if include_history:
            json["history"] = [message.to_json() for message in self.history]
        return json
