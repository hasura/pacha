from datetime import datetime
from typing import Optional, Sequence
from uuid import UUID
import aiosqlite
import json

from pydantic import BaseModel

from promptql_playground.thread import ThreadState
from promptql_playground.thread import Thread, ThreadMetadata


async def init_db(database_path: str):
    conn = await aiosqlite.connect(database_path)
    await conn.executescript('''
    CREATE TABLE IF NOT EXISTS threads (
        thread_id TEXT PRIMARY KEY,
        title TEXT,
        state JSON,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    -- Index for threads table
    CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at);
    CREATE INDEX IF NOT EXISTS idx_threads_thread_id ON threads(thread_id);
   ''')
    await conn.commit()
    await conn.close()


async def fetch_threads(db: aiosqlite.Connection) -> list[ThreadMetadata]:
    cursor = await db.execute("SELECT thread_id, title FROM threads order by created_at desc")
    rows = await cursor.fetchall()
    await cursor.close()
    return [ThreadMetadata(thread_id=UUID(row[0]), title=row[1]) for row in rows]


async def fetch_thread(db: aiosqlite.Connection, thread_id: UUID) -> Optional[Thread]:
    cursor = await db.execute("SELECT thread_id, title, state FROM threads WHERE thread_id = ?", (str(thread_id),))
    thread = await cursor.fetchone()
    await cursor.close()

    if thread:
        # Assuming state is stored as JSON
        state = ThreadState.model_validate_json(thread[2])
        return Thread(thread_id=UUID(thread[0]), title=thread[1], state=state)
    return None


async def insert_thread(
    db: aiosqlite.Connection, thread: Thread
) -> None:
    state_json = thread.state.model_dump_json()  # Convert ThreadState to JSON
    await db.execute('''
        INSERT INTO threads (thread_id, title, state, created_at)
        VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ''', (str(thread.thread_id), thread.title, state_json))
    await db.commit()


async def update_thread(
    db: aiosqlite.Connection, thread: Thread,
) -> None:
    state_json = thread.state.model_dump_json()  # Convert ThreadState to JSON
    await db.execute('''
        UPDATE threads
        SET title = ?, state = ?
        WHERE thread_id = ?
    ''', (thread.title, state_json, str(thread.thread_id)))
    await db.commit()
