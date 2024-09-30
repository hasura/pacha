from contextlib import asynccontextmanager
from dataclasses import dataclass
from fastapi import FastAPI, HTTPException, Depends, WebSocket
from fastapi.responses import JSONResponse, HTMLResponse, RedirectResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
import promptql.llms
import promptql.llms.anthropic
import promptql.sql
from pydantic import RootModel
from typing import override
import uuid
import argparse
import os
import uvicorn
import aiosqlite
import promptql
import promptql.logging

from promptql_playground.thread import ThreadState, new_thread

from .utils.cli_args import PromptQlConfig, add_promptql_config_args, build_promptql_config
from .utils.thread_storage import Thread, ThreadMetadata, fetch_thread, fetch_threads, init_db, insert_thread, update_thread
from promptql_playground import protocol
from promptql_playground.run import ThreadUpdateHandler, run_thread

DATABASE_PATH = "promptql_playground.db"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db(DATABASE_PATH)
    yield


app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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


@app.get("/threads")
async def get_threads(db: aiosqlite.Connection = Depends(get_db)) -> JSONResponse:
    threads = await fetch_threads(db)
    return JSONResponse(content=RootModel[list[ThreadMetadata]](threads).model_dump_json())


@app.get("/threads/{thread_id}")
async def get_thread(thread_id: uuid.UUID, db: aiosqlite.Connection = Depends(get_db)):
    try:
        thread = await fetch_thread(db, thread_id)
    except Exception as e:
        promptql.logging.get_logger().exception(str(e))
        raise HTTPException(
            status_code=500, detail="Internal error, check logs")
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    return JSONResponse(content=thread.model_dump_json())


@dataclass
class FastApiPromptQlWebsocket(protocol.WebSocket):
    websocket: WebSocket

    @override
    async def send(self, message: protocol.ServerMessage):
        await self.websocket.send_text(message.model_dump_json())

    @override
    async def recv(self) -> protocol.ClientMessage:
        json = await self.websocket.receive_text()
        return RootModel[protocol.ClientMessage].model_validate_json(json).root


@dataclass
class ThreadPersistenceHandler(ThreadUpdateHandler):
    db: aiosqlite.Connection

    @override
    async def on_update(self, thread: Thread):
        await update_thread(self.db, thread)


def get_promptql_config() -> PromptQlConfig:
    return app.state.promptql_config


@app.websocket("/threads/start")
async def start_thread(websocket: WebSocket, promptql_config: PromptQlConfig = Depends(get_promptql_config), db: aiosqlite.Connection = Depends(get_db)):
    await websocket.accept()
    thread = new_thread()
    await insert_thread(db, thread)
    update_handler = ThreadPersistenceHandler(db)
    await run_thread(llm=promptql_config.llm, websocket=FastApiPromptQlWebsocket(websocket), sql_engine=promptql_config.ddn, thread=thread, update_handler=update_handler)
    await websocket.close()


@app.websocket("/threads/{thread_id}/continue")
async def continue_thread(websocket: WebSocket, thread_id: uuid.UUID, promptql_config: PromptQlConfig = Depends(get_promptql_config), db: aiosqlite.Connection = Depends(get_db)):
    thread = await fetch_thread(db, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    await websocket.accept()
    update_handler = ThreadPersistenceHandler(db)
    await run_thread(llm=promptql_config.llm, websocket=FastApiPromptQlWebsocket(websocket), sql_engine=promptql_config.ddn, thread=thread, update_handler=update_handler)
    await websocket.close()


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


@app.get("/", response_class=RedirectResponse)
async def redirect_home():
    return RedirectResponse(url='/console')


def main():
    log_level = os.environ.get('LOG_LEVEL', 'INFO').upper()
    # TODO: setup logging
    port = int(os.environ.get('PORT', 5000))
    parser = argparse.ArgumentParser("Chat Server for PromptQL playground")
    add_promptql_config_args(parser)
    app.state.promptql_config = build_promptql_config(parser.parse_args())
    uvicorn.run(app, host="0.0.0.0", port=port, log_level=log_level.lower())


if __name__ == "__main__":
    main()
