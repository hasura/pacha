from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Callable
import uuid
import argparse
import os
import uvicorn

from pacha.sdk.llms.llm import Llm
from pacha.sdk.tools.tool import Tool
from pacha.utils.logging import setup_logger
from examples.utils.cli import add_llm_args, add_tool_args, get_llm, get_pacha_tool, add_auth_args
from examples.chat_server.pacha_chat import PachaChat
from examples.chat_server.threads import Thread, ThreadCreateResponseJson

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for threads
threads: Dict[str, Thread] = {}

# will be initialized in main
SECRET_KEY: Optional[str] = None
LLM: Llm = None  # type: ignore
PACHA_TOOL: Tool = None  # type: ignore
SYSTEM_PROMPT: str = "You are a helpful assistant"


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


@app.middleware("http")
async def verify_token(request: Request, call_next: Callable):
    if request.url.path in PUBLIC_ROUTES or SECRET_KEY is None:
        return await call_next(request)
    token = request.headers.get('pacha_auth_token')
    if not token or token != SECRET_KEY:
        return JSONResponse(status_code=401, content={"error": "pacha token invalid or not found"})
    return await call_next(request)

app.middleware("http")(verify_token)


class MessageInput(BaseModel):
    message: str
    stream: Optional[bool] = True


@app.get("/threads")
async def get_threads():
    return [thread.to_json(include_history=False) for thread in threads.values()]


@app.get("/threads/{thread_id}")
async def get_thread(thread_id: str):
    thread = threads.get(thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return thread.to_json()


@app.post("/threads")
async def start_thread(message_input: MessageInput = Body(default=None)):
    thread_id = str(uuid.uuid4())
    thread = Thread(id=thread_id, chat=PachaChat(
        llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT))
    threads[thread_id] = thread

    if message_input.stream:
        return StreamingResponse(thread.send_streaming(message_input.message), media_type="text/event-stream", status_code=201)
    else:
        json_response: ThreadCreateResponseJson = {
            "thread_id": thread_id
        }
        json_response["response"] = thread.send(
            message_input.message).to_json()
        return JSONResponse(content=json_response, status_code=201)


@app.post("/threads/{thread_id}")
async def send_message(thread_id: str, message_input: MessageInput):
    thread = threads.get(thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")

    if message_input.stream:
        return StreamingResponse(thread.send_streaming(message_input.message), media_type="text/event-stream")
    else:
        return JSONResponse(content=thread.send(message_input.message).to_json(), status_code=200)


@app.get("/console", response_class=HTMLResponse)
async def serve_console():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pacha Chat</title>
    </head>
    <body>
        <h1>Welcome</h1>
        <p>Head to <a href='https://console.hasura.io/local/chat'>https://console.hasura.io/local/chat</a></p>
    </body>
    </html>
    """


@app.get("/", response_class=RedirectResponse)
async def redirect_home():
    return RedirectResponse(url='/console')


def main():
    global LLM
    global PACHA_TOOL

    parser = argparse.ArgumentParser(description='Pacha Chat Server')
    add_auth_args(parser)
    add_llm_args(parser)
    add_tool_args(parser)
    args = parser.parse_args()
    init_auth(args.secret_key)
    PACHA_TOOL = get_pacha_tool(args, render_to_stdout=False)
    LLM = get_llm(args)
    init_system_prompt(PACHA_TOOL)

    log_level = os.environ.get('PACHA_LOG_LEVEL', 'INFO').upper()
    setup_logger(log_level)
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level=log_level.lower())


if __name__ == "__main__":
    main()
