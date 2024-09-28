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
from promptql.llm import Llm
from promptql.llms import openai, anthropic
from promptql.sql import DdnSqlEngine
import promptql.logging
from .thread_storage import Thread, ThreadMetadata, fetch_thread, fetch_threads, init_db, insert_thread, update_thread
from promptql_playground.thread import ThreadState
from promptql_playground import protocol
from promptql_playground.run import ThreadUpdateHandler, run_thread

DATABASE_PATH = "promptql_playground.db"


@dataclass
class ServerState:
    llm: Llm
    ddn: DdnSqlEngine


def get_cli_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Chat Server for PromptQL playground')
    parser.add_argument('-u', '--url',
                        help="Hasura DDN SQL endpoint URL", type=str)
    parser.add_argument('-H', '--header', dest='headers', type=str, action='append', default=[],
                        help='Headers to pass during the Hasura DDN request')
    parser.add_argument('--llm', type=str,
                        choices=['openai', 'anthropic'], default='anthropic')
    return parser.parse_args()


def get_ddn_engine(args: argparse.Namespace) -> DdnSqlEngine:
    headers_dict = {}
    for header in args.headers:
        header: str = header
        header_name, header_value = header.split(':', 1)
        headers_dict[header_name] = header_value.lstrip()

    return DdnSqlEngine(url=args.url, headers=headers_dict)


def get_llm(args: argparse.Namespace) -> Llm:
    if args.llm == 'openai':
        return openai.OpenAI()
    elif args.llm == 'anthropic':
        return anthropic.Anthropic(max_retries=5)
    print("Invalid LLM choice")
    exit(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ddn = get_ddn_engine(app.state.cli_args)
    llm = get_llm(app.state.cli_args)
    await init_db(DATABASE_PATH)
    app.state.server_state = ServerState(llm, ddn)
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
class PromptQlWebsocket(protocol.WebSocket):
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
    new_thread: bool

    @override
    async def on_update(self, thread: Thread):
        if self.new_thread:
            await insert_thread(self.db, thread)
            self.new_thread = False
        else:
            await update_thread(self.db, thread)


@app.websocket("/threads/start")
async def start_thread(websocket: WebSocket, db: aiosqlite.Connection = Depends(get_db)):
    await websocket.accept()
    update_handler = ThreadPersistenceHandler(db, new_thread=True)
    await run_thread(llm=app.state.server_state.llm, websocket=PromptQlWebsocket(websocket), sql_engine=app.state.server_state.ddn, thread=None, update_handler=update_handler)
    await websocket.close()


@app.websocket("/threads/{thread_id}/continue")
async def continue_thread(websocket: WebSocket, thread_id: uuid.UUID, db: aiosqlite.Connection = Depends(get_db)):
    thread = await fetch_thread(db, thread_id)
    if thread is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    await websocket.accept()
    update_handler = ThreadPersistenceHandler(db, new_thread=False)
    await run_thread(llm=app.state.server_state.llm, websocket=PromptQlWebsocket(websocket), sql_engine=app.state.server_state.ddn, thread=thread, update_handler=update_handler)
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
    app.state.cli_args = get_cli_args()
    uvicorn.run(app, host="0.0.0.0", port=port, log_level=log_level.lower())


if __name__ == "__main__":
    main()
