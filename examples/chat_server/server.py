from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Callable
import uuid
import argparse
import os
import uvicorn
import asyncio

from pacha.sdk.llm import Llm
from pacha.sdk.tool import Tool
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
        You are Pacha - a helpful assistant that is connected to user's data. If needed, use the "{pacha_tool.name()}" tool to retrieve, observe, or process any contextual user data relevant to the conversation.
        Do not call this tool out to the user - from a user's point of view you are doing everything as a single system.
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


class ConfirmationInput(BaseModel):
    confirmation_id: str
    confirm: bool


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
        return StreamingResponse(
            thread.send_streaming(message_input.message),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
            status_code=201
        )
    else:
        json_response: ThreadCreateResponseJson = {
            "thread_id": thread_id
        }
        json_response["response"] = (await thread.send(
            message_input.message)).to_json(thread.chat.artifacts)
        return JSONResponse(content=json_response, status_code=201)


@app.post("/threads/{thread_id}")
async def send_message(thread_id: str, message_input: MessageInput):
    thread = threads.get(thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")

    if message_input.stream:
        return StreamingResponse(
            thread.send_streaming(message_input.message),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
        )
    else:
        return JSONResponse(content=(await thread.send(message_input.message)).to_json(thread.chat.artifacts), status_code=200)


@app.post("/threads/{thread_id}/user_confirmation")
async def send_user_confirmation(thread_id: str, confirmation_input: ConfirmationInput):
    thread = threads.get(thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    thread.chat.handle_user_confirmation(
        confirmation_input.confirmation_id, confirmation_input.confirm)
    return JSONResponse(content={}, status_code=200)


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


async def async_setup():
    global LLM
    global PACHA_TOOL

    parser = argparse.ArgumentParser(description='Pacha Chat Server')
    add_auth_args(parser)
    add_llm_args(parser)
    add_tool_args(parser)
    args = parser.parse_args()
    init_auth(args.secret_key)
    PACHA_TOOL = await get_pacha_tool(args, render_to_stdout=False)
    LLM = get_llm(args)
    init_system_prompt(PACHA_TOOL)


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_setup())
    log_level = os.environ.get('PACHA_LOG_LEVEL', 'INFO').upper()
    setup_logger(log_level)
    port = os.environ.get('PORT', 5000)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level=log_level.lower())


if __name__ == "__main__":
    main()
