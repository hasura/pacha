from typing import Sequence
import aiosqlite
import json


from pacha.sdk.chat import Turn
from pacha.data_engine.artifacts import Artifacts, Artifact
from pacha.data_engine.user_confirmations import UserConfirmationResult
from examples.chat_server.chat_json import to_turn_json, from_turn_json, from_artifact_json, PachaTurn


async def init_db(database_path):
    conn = await aiosqlite.connect(database_path)
    await conn.executescript('''
    CREATE TABLE IF NOT EXISTS threads (
        thread_id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS turns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        message TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        artifact_id TEXT NOT NULL,
        artifact_json TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS user_confirmations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        confirmation_id TEXT NOT NULL,
        status TEXT,
        created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        
        UNIQUE(thread_id, confirmation_id)
    );
    -- Index for threads table
    CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at);     
 
    -- Indexes for turns table
    CREATE INDEX IF NOT EXISTS idx_turns_thread_id ON turns(thread_id);

    -- Indexes for artifacts table
    CREATE INDEX IF NOT EXISTS idx_artifacts_thread_id ON artifacts(thread_id);

    -- Indexes for user_confirmations table
    CREATE INDEX IF NOT EXISTS idx_user_confirmations_thread_id ON user_confirmations(thread_id);

   ''')
    await conn.commit()
    await conn.close()


async def fetch_threads(db: aiosqlite.Connection):
    cursor = await db.execute("SELECT thread_id, title FROM threads order by created_at desc")
    rows = await cursor.fetchall()
    return [{"thread_id": row[0], "title": row[1]} for row in rows]


async def fetch_thread(db: aiosqlite.Connection, thread_id: str):
    cursor = await db.execute("SELECT thread_id, title from threads where thread_id = ?", (thread_id,))
    thread = await cursor.fetchone()
    if thread is None:
        return None
    else:
        return {"thread_id": thread[0], "title": thread[1]}


async def persist_thread(db: aiosqlite.Connection, thread_id: str, title: str):
    await db.execute("INSERT INTO threads (thread_id, title) VALUES (?, ?);",  (thread_id, title))


async def persist_turn(db: aiosqlite.Connection, thread_id: str, turn: PachaTurn, artifacts: Artifacts):
    await db.execute('''INSERT INTO turns (thread_id, message)
                        VALUES (?, ?);''', (thread_id, json.dumps(to_turn_json(turn, artifacts))))


async def persist_turn_many(db: aiosqlite.Connection, thread_id: str, turns: Sequence[Turn], artifacts: Artifacts):
    params = [{'message': json.dumps(to_turn_json(
        msg, artifacts))} for msg in turns]
    if len(params) > 0:
        await db.executemany(f'''INSERT INTO turns (thread_id, message)
                             VALUES  ('{thread_id}', :message);''', params)


async def persist_artifacts(db: aiosqlite.Connection, thread_id: str, artifacts: dict[str, Artifact]):
    artifact_params = [{'artifact_id': artifact.identifier, 'artifact_json': json.dumps(artifact.to_json())}
                       for artifact in artifacts.values()]
    if len(artifact_params) > 0:
        await db.executemany(f'''INSERT INTO artifacts (thread_id, artifact_id, artifact_json)
                             VALUES ('{thread_id}', :artifact_id, :artifact_json);''', artifact_params)


async def fetch_turns(db: aiosqlite.Connection, thread_id: str) -> list[PachaTurn]:
    cursor = await db.execute(
        "SELECT message FROM turns WHERE thread_id = ? ORDER BY id", (thread_id,))
    turn_rows = await cursor.fetchall()
    turns: list[PachaTurn] = []
    for turn_row in turn_rows:
        turn = from_turn_json(turn_row[0])
        turns.append(turn)
    return turns


async def fetch_artifacts(db: aiosqlite.Connection, thread_id: str) -> dict[str, Artifact]:
    cursor = await db.execute(
        "SELECT artifact_json FROM artifacts WHERE thread_id = ? order by id", (thread_id,))
    artifact_rows = await cursor.fetchall()
    artifacts: dict[str, Artifact] = {}
    for artifact_row in artifact_rows:
        artifact = from_artifact_json(artifact_row[0])
        artifacts[artifact.identifier] = artifact
    return artifacts


async def update_user_confirmation(db: aiosqlite.Connection, thread_id: str, confirmation_id: str, status: UserConfirmationResult):
    await db.execute(
            '''INSERT INTO user_confirmations (thread_id, confirmation_id, status)
            VALUES (?, ?, ?) ON CONFLICT(thread_id, confirmation_id) DO NOTHING;''', (thread_id, confirmation_id, status.name))


async def fetch_user_confirmations(db: aiosqlite.Connection, thread_id: str):
    cursor = await db.execute(
        "SELECT confirmation_id, status FROM user_confirmations WHERE thread_id = ? order by id", (thread_id,))
    confirmation_rows = await cursor.fetchall()
    user_confirmations: dict[str, UserConfirmationResult] = {}
    for row in confirmation_rows:
        user_confirmations[row[0]] = UserConfirmationResult[row[1]]
    return user_confirmations
