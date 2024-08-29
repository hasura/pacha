from fastapi import FastAPI, Request, HTTPException, Depends, Body
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Callable
from contextlib import asynccontextmanager
import uuid
import argparse
import os
import uvicorn
import asyncio
import aiosqlite

from pacha.sdk.llm import Llm
from pacha.sdk.tool import Tool
from pacha.utils.logging import setup_logger, get_logger
from examples.utils.cli import add_llm_args, add_tool_args, get_llm, get_pacha_tool, add_auth_args
from examples.chat_server.pacha_chat import PachaChat
from examples.chat_server.chat_json import to_turn_json
from examples.chat_server.threads import ThreadJson, ThreadCreateResponseJson, ThreadMessageResponseJson, Thread, ThreadNotFound
from examples.chat_server.db import fetch_thread_ids, persist_thread_id

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database setup
DATABASE_NAME = "pacha.db"


async def init_db():
    conn = await aiosqlite.connect(DATABASE_NAME)
    await conn.executescript('''
     CREATE TABLE IF NOT EXISTS threads (
         thread_id TEXT PRIMARY KEY,
         created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     );
     CREATE TABLE IF NOT EXISTS turns (
         thread_id TEXT NOT NULL,
         turn_id INTEGER PRIMARY KEY AUTOINCREMENT,
         message TEXT,
         created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     );
     CREATE TABLE IF NOT EXISTS artifacts (
         thread_id TEXT NOT NULL,
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         artifact_id TEXT NOT NULL,
         artifact_json TEXT,
         created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     );
     ''')
    await conn.commit()
    await conn.close()


async def get_db():
    conn = await aiosqlite.connect(database=DATABASE_NAME, autocommit=True)
    try:
        yield conn
    finally:
        await conn.close()

# get_async_db does not close connection when the function calling it has finished, needs to be handled explicitly
# required in streaming functions


@asynccontextmanager
async def get_async_db():
    conn = await aiosqlite.connect(database=DATABASE_NAME, autocommit=True)
    yield conn


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
async def get_threads(db: aiosqlite.Connection = Depends(get_db)):
    thread_ids = await fetch_thread_ids(db)
    return [ThreadJson(thread_id=id) for id in thread_ids]


@app.get("/threads/{thread_id}")
async def get_thread(thread_id: str, db: aiosqlite.Connection = Depends(get_db)):
    try:
        default_chat = PachaChat(
            llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
        thread = await Thread.from_db(thread_id, default_chat, db)
    except ThreadNotFound as e:
        raise HTTPException(status_code=404, detail="Thread not found")
    except Exception as e:
        get_logger().error(f"An unexpected error occurred: {e}")
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")
    return thread.to_json()


@app.post("/threads")
async def start_thread(message_input: MessageInput):

    async with get_async_db() as db:
        thread_id = str(uuid.uuid4())
        await persist_thread_id(db, thread_id)

        thread = Thread(id=thread_id, chat=PachaChat(
            llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT), db=db)
        if message_input.stream:
            return StreamingResponse(
                thread.send_streaming(message_input.message),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache",
                         "Connection": "keep-alive"},
                status_code=201
            )
        else:
            messages = await thread.send(message_input.message)
            await db.close()
            response: ThreadCreateResponseJson = {
                "thread_id": thread_id,
                "messages": list(
                    map(lambda m: to_turn_json(m, thread.chat.artifacts), messages))
            }
            return JSONResponse(content=response, status_code=201)


@app.post("/threads/{thread_id}")
async def send_message(thread_id: str, message_input: MessageInput):
    async with get_async_db() as db:
        try:
            default_chat = PachaChat(
                llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
            thread = await Thread.from_db(thread_id, default_chat, db)
        except ThreadNotFound as e:
            raise HTTPException(status_code=404, detail="Thread not found")
        except Exception as e:
            get_logger().error(f"Exception occurred: {e}")
            raise HTTPException(
                status_code=500, detail="Internal error, check logs")

        if message_input.stream:
            return StreamingResponse(
                thread.send_streaming(message_input.message),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache",
                         "Connection": "keep-alive"}
            )
        else:
            messages = await thread.send(message_input.message)
            await db.close()
            response: ThreadMessageResponseJson = {
                "messages": list(
                    map(lambda m: to_turn_json(m, thread.chat.artifacts), messages))
            }
            return JSONResponse(content=response, status_code=200)


@app.post("/threads/{thread_id}/user_confirmation")
async def send_user_confirmation(thread_id: str, confirmation_input: ConfirmationInput,  db: aiosqlite.Connection = Depends(get_db)):
    try:
        default_chat = PachaChat(
            llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
        thread = await Thread.from_db(thread_id, default_chat, db)
    except ThreadNotFound as e:
        raise HTTPException(status_code=404, detail="Thread not found")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")
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
    await init_db()


def main():
    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_setup())
    log_level = os.environ.get('PACHA_LOG_LEVEL', 'INFO').upper()
    setup_logger(log_level)
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level=log_level.lower())


if __name__ == "__main__":
    main()
