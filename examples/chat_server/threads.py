from dataclasses import dataclass, field
from typing import NotRequired, Optional, TypedDict
from pacha.data_engine import SqlOutput
from examples.chat_server.chat import PachaChat, PachaChatResponse


class DataFetch(TypedDict):
    sql: str
    result: SqlOutput


class MessageJson(TypedDict):
    text : str
    query_plan: Optional[str]
    query_plan_output: Optional[str]
    data_fetches: NotRequired[list[DataFetch]]


class ThreadCreateResponseJson(TypedDict):
    thread_id: str
    messages: NotRequired[list[MessageJson]]


class ThreadMessageJson(TypedDict):
    messages: list[MessageJson]


class ThreadJson(TypedDict):
    thread_id: str
    history: NotRequired[list[ThreadMessageJson]]


@dataclass
class ThreadMessage:
    user_message: str
    pacha_response: PachaChatResponse

    def to_json(self) -> ThreadMessageJson:
        return {
            "message": self.user_message,
            "response": self.response_to_json()
        }

    def get_input(self, tool_call):
        tool_input = tool_call.input
        return tool_input

    def get_output(self, tool_call):
        tool_output = tool_call.output
        return tool_output.get_response()

    def get_sql(self, tool_call):
        tool_output = tool_call.output
        data_fetches = []
        for sql_statement in tool_output.sql_statements:
            data_fetches.append({
                "sql": sql_statement.sql,
                "response": sql_statement.result})
        return data_fetches
    
    
    def response_to_json(self) -> ThreadMessageJson:
        messages: list[MessageJson] = []
        for message in self.pacha_response.response_messages:
            
          message_json: MessageJson = {
            "text": message.text,
            "query_plan": list(map(self.get_input, message.tool_calls)),
            "query_plan_output": list(map(self.get_output, message.tool_calls)),
            "data_fetches": sum(map(self.get_sql, message.tool_calls), []) # flatten list of lists
            }
          
          messages.append(message_json)
        return messages


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
