from dataclasses import dataclass, field
from typing import NotRequired, Optional, TypedDict, AsyncGenerator, Any
from pacha.sdk.chat import UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse
from examples.chat_server.chat_json import AssistantTurnJson, ToolResponseTurnJson, to_assistant_turn_json, to_tool_response_turn_json
from pacha.utils.logging import get_logger
from examples.chat_server.pacha_chat import PachaChat, ChatFinish

import json


START_EVENT = 'start'
ASSISTANT_RESPONSE_EVENT = 'assistant_response_message'
TOOL_RESPONSE_EVENT = 'tool_response_message'
FINISH_EVENT = 'finish'


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
            "assistant_messages": list(map(lambda m: to_assistant_turn_json(m) if isinstance(m, AssistantTurn) else to_tool_response_turn_json(m), self.assistant_messages))
        }


@dataclass
class Thread:
    id: str
    chat: PachaChat
    history: list[ThreadMessage] = field(default_factory=list)

    def send(self, message: str) -> ThreadMessage:
        assistant_messages = self.chat.process_chat(message)
        thread_message = ThreadMessage(UserTurn(message), assistant_messages)
        self.history.append(thread_message)
        return thread_message

    async def send_streaming(self, message: str) -> AsyncGenerator[Any, None]:
        logger = get_logger()

        current_message = ThreadMessage(
            user_message=UserTurn(message), assistant_messages=[])

        start_event_data = json.dumps({"thread_id": self.id})
        yield f"event: {START_EVENT}\ndata: {start_event_data}\n\n"

        async for chunk in self.chat.process_chat_streaming(message):

            if isinstance(chunk, AssistantTurn):
                current_message.assistant_messages.append(chunk)
                event_data = json.dumps(to_assistant_turn_json(chunk))
                yield f"event: {ASSISTANT_RESPONSE_EVENT}\ndata: {event_data}\n\n"

            elif isinstance(chunk, ToolCallResponse):
                event_data = json.dumps(to_tool_response_turn_json(chunk))
                yield f"event: {TOOL_RESPONSE_EVENT}\ndata: {event_data}\n\n"

            elif isinstance(chunk, ToolResponseTurn):
                current_message.assistant_messages.append(chunk)

            elif isinstance(chunk, ChatFinish):
                self.history.append(current_message)
                yield f"event: {FINISH_EVENT}\ndata: {{}}\n\n"

            else:
                # handle unknown chunk types
                event_data = json.dumps(
                    {"unknown_data": str(chunk)[0:40]})  # log max 40 chars
                logger.warn(f"event: unknown\ndata: {event_data}\n\n")

    def to_json(self, include_history: bool = True) -> ThreadJson:
        json: ThreadJson = {
            "thread_id": self.id
        }
        if include_history:
            json["history"] = [message.to_json() for message in self.history]
        return json
