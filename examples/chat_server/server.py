from flask import Flask, request, jsonify, render_template_string, redirect
from flask_cors import CORS
from pacha.sdk.chat import PachaChat
from pacha.utils.llm import Llm
from pacha.utils.tool import Tool
from examples.utils.cli import add_llm_args, add_tool_args, get_llm, get_pacha_tool, add_auth_args
from examples.chat_server.threads import Thread, ThreadCreateResponseJson
from examples.utils.cli import add_llm_args, add_tool_args, get_llm, get_pacha_tool, add_auth_args

import uuid
import argparse


app = Flask(__name__)
CORS(app)


# will be initialized in main
SECRET_KEY = None
LLM: Llm = None  # type: ignore
PACHA_TOOL: Tool = None
SYSTEM_PROMPT: str | None = None


def init_system_prompt(pacha_tool):
    global SYSTEM_PROMPT
    if pacha_tool:
        SYSTEM_PROMPT = f"""
        You are a helpful assistant. If needed, use the "{pacha_tool.name()}" tool to retrieve any contextual user data relevant to the conversation.
        {pacha_tool.system_prompt_fragment()}
        """


PUBLIC_ROUTES = ['/', '/console']


def init_auth(secret_key):
    global SECRET_KEY
    SECRET_KEY = secret_key


@app.before_request
def authenticate():
    if request.path in PUBLIC_ROUTES or SECRET_KEY is None:
        return
    token = request.headers.get('pacha_auth_token')
    if not token or token != SECRET_KEY:
        return jsonify({"error": "pacha token invalid or not found"}), 401


@app.route('/chat', methods=['POST'])
def start_thread():
    data = request.json
    thread_id = data.get('thread_id')
    previous_messages = data.get('previous_messages')
    query = data.get('query')
    if query is None:
        return jsonify({"error": "no query given"}), 400
    if thread_id is None:
        thread_id = str(uuid.uuid4())
    thread = Thread(id=thread_id, chat=PachaChat(
        llm=LLM, tools=[PACHA_TOOL], system_prompt=SYSTEM_PROMPT, previous_messages=previous_messages))
    response: ThreadCreateResponseJson = {
        "thread_id": thread_id
    }
    response["response"] = thread.send(query).response_to_json()
    return jsonify(response), 200


@app.route('/console', methods=['GET'])
def serve_console():
    template = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pacha Chat</title>
    </head>
    <body>
        <h1>Welcome</h1>
        <p>This is a dynamically generated page using Flask.</p>
    </body>
    </html>
    """
    return render_template_string(template)


@app.route('/')
def redirect_home():
    return redirect('/console')


def main():
    global LLM
    global PACHA_TOOL
    parser = argparse.ArgumentParser(
        description='Pacha Chat Server')
    add_auth_args(parser)
    add_llm_args(parser)
    add_tool_args(parser)
    args = parser.parse_args()
    init_auth(args.secret_key)
    PACHA_TOOL = get_pacha_tool(args)
    LLM = get_llm(args)
    init_system_prompt(PACHA_TOOL)
    app.run()


if __name__ == "__main__":
    main()
