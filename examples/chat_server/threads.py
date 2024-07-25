from dataclasses import dataclass, field
from typing import NotRequired, Optional, TypedDict
from examples.chat_server.chat import PachaChat, PachaChatResponse, AssistantMessageJson


class ThreadMessageJson(TypedDict):
    user_message: str
    assistant_messages: list[AssistantMessageJson]


class ThreadCreateResponseJson(TypedDict):
    thread_id: str
    response: NotRequired[ThreadMessageJson]


class ThreadJson(TypedDict):
    thread_id: str
    history: NotRequired[list[ThreadMessageJson]]


@dataclass
class ThreadMessage:
    user_message: str
    pacha_response: PachaChatResponse

    def to_json(self) -> ThreadMessageJson:
        return {
            "user_message": self.user_message,
            "assistant_messages": list(map(lambda m: m.to_json(), self.pacha_response.assistant_messages))
        }


@dataclass
class Thread:
    id: str
    chat: PachaChat
    history: list[ThreadMessage] = field(default_factory=list)

    def send(self, message: str) -> ThreadMessage:
        pacha_response = self.chat.process_chat(message)
        thread_message = ThreadMessage(message, pacha_response)
        self.history.append(thread_message)
        return thread_message

    def to_json(self, include_history: bool = True) -> ThreadJson:
        json: ThreadJson = {
            "thread_id": self.id
        }
        if include_history:
            json["history"] = [message.to_json() for message in self.history]
        return json
