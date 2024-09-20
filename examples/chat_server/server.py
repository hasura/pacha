from fastapi import FastAPI, Request, HTTPException, Depends, Body, BackgroundTasks
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse, StreamingResponse, PlainTextResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, List, Callable
from enum import Enum
import uuid
import argparse
import os
import uvicorn
import asyncio
import aiosqlite
import httpx

from pacha.sdk.llm import Llm
from pacha.sdk.tool import Tool
from pacha.data_engine.user_confirmations import UserConfirmationResult
from pacha.utils.logging import setup_logger, get_logger
from examples.utils.cli import add_llm_args, add_tool_args, get_llm, get_pacha_tool
from examples.chat_server.pacha_chat import PachaChat
from examples.chat_server.chat_json import to_turn_json
from examples.chat_server.threads import ThreadJson, ThreadMessageResponseJson, Thread, ThreadNotFound
from examples.chat_server.db import init_db, fetch_threads, persist_thread, update_user_confirmation


# will be initialized in main
SECRET_KEY: Optional[str] = None
LLM: Llm = None  # type: ignore
PACHA_TOOL: Tool = None  # type: ignore
SYSTEM_PROMPT: str = "You are a helpful assistant"
DATABASE_PATH: str = "pacha.db"
CORS_ORIGINS: List[str] = ["*"]


app = FastAPI()
# Mount the static files
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="static")

# initialize cors
origins = os.environ.get("CORS_ORIGINS", "*")
CORS_ORIGINS = [origin.strip() for origin in origins.split(",")]


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    # Allow origin to be passed via env variable for deployment
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_db():
    conn = await aiosqlite.connect(database=DATABASE_PATH, autocommit=True)
    try:
        yield conn
    finally:
        await conn.close()


async def get_db_open():
    return await aiosqlite.connect(database=DATABASE_PATH, autocommit=True)


async def closedb(db: aiosqlite.Connection):
    await db.close()


def init_system_prompt(pacha_tool):
    global SYSTEM_PROMPT
    if pacha_tool:
        SYSTEM_PROMPT = f"""
        You are Pacha - a helpful assistant that is connected to user's data. If needed, use the "{pacha_tool.name()}" tool to retrieve, observe, or process any contextual user data relevant to the conversation.
        Do not call this tool out to the user - from a user's point of view you are doing everything as a single system.
        """


PUBLIC_ROUTES = [
    '/',
    '/console',
    '/healthz',
    '/chat',
    '/chat/*',
    '/assets/*'
]

def init_auth(secret_key):
    global SECRET_KEY
    SECRET_KEY = secret_key



@app.middleware("http")
async def verify_token(request: Request, call_next: Callable):
    # Allow OPTIONS requests to pass through without authentication
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # Check if the path matches any of the public routes
    path = request.url.path
    for public_route in PUBLIC_ROUTES:
        if public_route.endswith('*'):
            # For routes ending with *, check if the path starts with the route (excluding *)
            if path.startswith(public_route[:-1]):
                return await call_next(request)
        else:
            # For routes without *, require an exact match
            if path == public_route:
                return await call_next(request)
    
    # If SECRET_KEY is not set, all routes are public
    if SECRET_KEY is None:
        return await call_next(request)
    
    # For all other routes, verify the token
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
    threads = await fetch_threads(db)
    return [ThreadJson(thread_id=thread['thread_id'], title=thread['title']) for thread in threads]


@app.get("/threads/{thread_id}")
async def get_thread(thread_id: str, db: aiosqlite.Connection = Depends(get_db)):
    try:
        default_chat = PachaChat(id=thread_id,
                                 llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
        thread = await Thread.from_db(thread_id, default_chat, db)
        return thread.to_json()
    except ThreadNotFound as e:
        raise HTTPException(status_code=404, detail="Thread not found")
    except Exception as e:
        get_logger().exception(str(e))
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")


@app.post("/threads")
async def start_thread(message_input: MessageInput):
    db = None
    try:
        db = await get_db_open()
        thread_id = str(uuid.uuid4())
        title = message_input.message[slice(40)]
        await persist_thread(db, thread_id, title)
        thread = Thread(id=thread_id, title=title,
                        chat=PachaChat(id=thread_id, llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT), db=db)
        background_tasks = BackgroundTasks()
        background_tasks.add_task(closedb, db)
        if message_input.stream:
            return StreamingResponse(
                thread.send_streaming(message_input.message),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache",
                         "Connection": "keep-alive"},
                status_code=201,
                background=background_tasks
            )
        else:
            messages = await thread.send(message_input.message)
            response: ThreadMessageResponseJson = {
                "thread_id": thread_id,
                "messages": list(
                    map(lambda m: to_turn_json(m, thread.chat.artifacts), messages))
            }
            return JSONResponse(content=response, status_code=201, background=background_tasks)
    except Exception as e:
        if db is not None:
            await db.close()
        get_logger().exception(str(e))
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")


@app.post("/threads/{thread_id}")
async def send_message(thread_id: str, message_input: MessageInput):
    db = None
    try:
        db = await get_db_open()
        default_chat = PachaChat(id=thread_id,
                                 llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
        thread = await Thread.from_db(thread_id, default_chat, db)
        background_tasks = BackgroundTasks()
        background_tasks.add_task(closedb, db)
        if message_input.stream:
            return StreamingResponse(
                thread.send_streaming(message_input.message),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache",
                         "Connection": "keep-alive"},
                background=background_tasks
            )
        else:
            messages = await thread.send(message_input.message)
            await db.close()
            response: ThreadMessageResponseJson = {
                "thread_id": thread_id,
                "messages": list(
                    map(lambda m: to_turn_json(m, thread.chat.artifacts), messages))
            }
            return JSONResponse(content=response, status_code=200, background=background_tasks)
    except ThreadNotFound as e:
        if db is not None:
            await db.close()
        raise HTTPException(status_code=404, detail="Thread not found")
    except Exception as e:
        if db is not None:
            await db.close()
        get_logger().exception(str(e))
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")


@app.post("/threads/{thread_id}/user_confirmation")
async def send_user_confirmation(thread_id: str, confirmation_input: ConfirmationInput,  db: aiosqlite.Connection = Depends(get_db)):
    try:
        default_chat = PachaChat(id=thread_id,
                                 llm=LLM, pacha_tool=PACHA_TOOL, system_prompt=SYSTEM_PROMPT)
        thread = await Thread.from_db(thread_id, default_chat, db)
        confirmation_result = UserConfirmationResult.APPROVED if confirmation_input.confirm else UserConfirmationResult.DENIED
        await update_user_confirmation(db, thread_id, confirmation_input.confirmation_id, confirmation_result)
        thread.chat.handle_user_confirmation(
            confirmation_input.confirmation_id, confirmation_input.confirm)
        return JSONResponse(content={}, status_code=200)
    except ThreadNotFound as e:
        raise HTTPException(status_code=404, detail="Thread not found")
    except Exception as e:
        get_logger().exception(str(e))
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")


class FeedbackMode(str, Enum):
    NO_DATA = "no_data"
    CONSENT_MESSAGE = "consent_message"
    CONSENT_FULL = "consent_full"


class FeedbackInput(BaseModel):
    mode: Optional[FeedbackMode] = FeedbackMode.NO_DATA
    message: Optional[str] = None
    feedback_enum: int
    feedback_text: Optional[str]


@app.post("/threads/{thread_id}/submit-feedback")
async def submit_feedback(thread_id: str, feedback_input: FeedbackInput):

    telemtry_url = "https://telemetry.hasura.io/v1/http"

    data = {
        "thread_id": thread_id,
        "mode": feedback_input.mode,
        "feedback_enum": feedback_input.feedback_enum,
    }

    # do not add message if mode is no_data
    if feedback_input.mode != FeedbackMode.NO_DATA and feedback_input.message:
        data["message"] = feedback_input.message

    if feedback_input.feedback_text:
        data["feedback_text"] = feedback_input.feedback_text

    payload = {
        "topic": "pacha_chat",
        "data": data
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(telemtry_url, json=payload)
            response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)

        return {"status": "success", "message": "Feedback submitted successfully"}
    except httpx.HTTPError as e:
        get_logger().error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error submitting feedback")


@app.get("/healthz", response_class=PlainTextResponse)
async def health_check():
    return "OK"


@app.get("/config-check", response_class=PlainTextResponse)
async def config_check():
    return "OK"


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

# Frontend route (only for root path)
@app.get("/")
@app.get("/chat/{path:path}")
async def serve_frontend_root():
    return FileResponse("frontend/dist/index.html")


async def async_setup():
    global LLM
    global PACHA_TOOL
    global DATABASE_PATH
    global CORS_ORIGINS

    parser = argparse.ArgumentParser(description='Pacha Chat Server')
    add_llm_args(parser)
    add_tool_args(parser)
    args = parser.parse_args()
    PACHA_TOOL = await get_pacha_tool(args, render_to_stdout=False)
    LLM = get_llm(args)
    init_system_prompt(PACHA_TOOL)

    # initialize auth
    secret_key = os.environ.get("SECRET_KEY", None)
    init_auth(secret_key=secret_key)

    # initialize sqlite db
    DATABASE_PATH = os.environ.get("SQLITE_PATH", "pacha.db")
    await init_db(DATABASE_PATH)


def main():
    asyncio.run(async_setup())
    log_level = os.environ.get('LOG_LEVEL', 'INFO').upper()
    setup_logger(log_level)
    port = int(os.environ.get('PORT', 5000))

    # Check if the frontend build exists
    if not os.path.exists("frontend/dist"):
        get_logger().warning("Frontend build not found. Make sure to build the React app and place it in frontend/dist")

    uvicorn.run(app, host="0.0.0.0", port=port, log_level=log_level.lower())


if __name__ == "__main__":
    main()
