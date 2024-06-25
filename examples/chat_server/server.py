from dataclasses import dataclass, field
from typing import Any, NotRequired, Optional, TypedDict
from flask import Flask, request, jsonify
import uuid
from examples.utils.cli import add_data_engine_args, get_data_engine
from pacha.data_engine.data_engine import SqlOutput
from pacha.query_planner import QueryPlanner
from pacha.sdk.chat import PachaChat, PachaChatResponse
import argparse

from pacha.utils.llm.llama.together import LlamaOnTogether

app = Flask(__name__)


class DataFetch(TypedDict):
    sql: str
    result: SqlOutput


class MessageResponseJson(TypedDict):
    response: str
    query_plan_python: Optional[str]
    query_plan_output: Optional[str]
    data_fetches: NotRequired[list[DataFetch]]


class ThreadCreateResponseJson(TypedDict):
    thread_id: str
    response: NotRequired[MessageResponseJson]


class ThreadMessageJson(TypedDict):
    message: str
    response: MessageResponseJson


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

    def response_to_json(self) -> MessageResponseJson:
        response_json: MessageResponseJson = {
            "response": self.pacha_response.llm_response,
            "query_plan_python": self.pacha_response.data_context.query_plan.python_code,
            "query_plan_output": None,
            "data_fetches": []
        }

        if self.pacha_response.data_context.data is not None:
            query_plan_output = self.pacha_response.data_context.data.output
            if self.pacha_response.data_context.data.error is not None:
                query_plan_output += self.pacha_response.data_context.data.error
            response_json["query_plan_output"] = query_plan_output
            data_fetches = []
            for sql_statement in self.pacha_response.data_context.data.sql_statements:
                data_fetches.append({
                    "sql": sql_statement.sql,
                    "response": sql_statement.result
                })
            response_json["data_fetches"] = data_fetches

        return response_json


@dataclass
class Thread:
    id: str
    chat: PachaChat
    history: list[ThreadMessage] = field(default_factory=list)

    def send(self, message: str) -> ThreadMessage:
        pacha_response = self.chat.chat(message)
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


# In-memory storage for threads
threads: dict[str, Thread] = {}

# will be initialized in main
query_planner: QueryPlanner = None  # type: ignore


@app.route('/threads', methods=['GET'])
def get_threads():
    return jsonify([thread.to_json(include_history=False) for thread in threads.values()]), 200


@app.route('/threads/<thread_id>', methods=['GET'])
def get_thread(thread_id):
    thread = threads.get(thread_id)
    if thread is None:
        return jsonify({"error": "Thread not found"}), 404

    return jsonify(thread.to_json()), 200


@app.route('/threads', methods=['POST'])
def start_thread():
    data = request.json
    thread_id = str(uuid.uuid4())
    thread = Thread(id=thread_id, chat=PachaChat(
        query_planner, chat_llm=LlamaOnTogether()))
    threads[thread_id] = thread
    json_response: ThreadCreateResponseJson = {
        "thread_id": thread_id
    }
    if isinstance(data, dict):
        message = data.get('message')
        if message is not None:
            json_response["response"] = thread.send(message).response_to_json()

    return jsonify(json_response), 201


@app.route('/threads/<thread_id>', methods=['POST'])
def send_message(thread_id):
    thread = threads.get(thread_id)
    if thread is None:
        return jsonify({"error": "Thread not found"}), 404

    data = request.json
    if isinstance(data, dict):
        message = data.get('message')
        if message is not None:
            return jsonify(thread.send(message).response_to_json()), 200

    return jsonify({"error": "invalid input"}), 400


def main():
    global query_planner
    parser = argparse.ArgumentParser(
        description='Pacha Chat Server')
    add_data_engine_args(parser)
    args = parser.parse_args()
    data_engine = get_data_engine(args)
    query_planner = QueryPlanner(data_engine)
    app.run()

if __name__ == "__main__":
    main()