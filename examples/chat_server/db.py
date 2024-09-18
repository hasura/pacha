from typing import Sequence, Optional, List
import aiosqlite
import json
from datetime import datetime

from pacha.sdk.chat import Turn
from pacha.data_engine.artifacts import Artifacts, Artifact
from pacha.data_engine.user_confirmations import UserConfirmationResult
from examples.chat_server.chat_json import to_turn_json, from_turn_json, from_artifact_json, PachaTurn, ThreadJson, to_user_confirmation_status_json
from examples.chat_server.pacha_chat import UserConfirmationStatus


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
    CREATE INDEX IF NOT EXISTS idx_threads_thread_id ON threads(thread_id);     
 
    -- Indexes for turns table
    CREATE INDEX IF NOT EXISTS idx_turns_thread_id ON turns(thread_id);

    -- Indexes for artifacts table
    CREATE INDEX IF NOT EXISTS idx_artifacts_thread_id ON artifacts(thread_id);

    -- Indexes for user_confirmations table
    CREATE INDEX IF NOT EXISTS idx_user_confirmations_thread_id ON user_confirmations(thread_id);

   ''')
    await conn.commit()
    await conn.close()


async def fetch_threads(
    db: aiosqlite.Connection,
    limit: int = 100,
    offset: int = 0,
    created_after: Optional[datetime] = None,
    include_history: bool = False
) -> List[ThreadJson]:

    query = """
        SELECT 
            t.thread_id, 
            t.title, 
            t.created_at
        FROM threads t
        WHERE 1=1
        """

    params = []

    if created_after:
        query += " AND t.created_at > ?"
        params.append(created_after.isoformat())

    query += 'ORDER BY t.created_at DESC'

    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()

    threads: dict[str, ThreadJson] = {}

    for row in rows:
        thread_id, title, created_at, *_ = row
        if thread_id not in threads:
            threads[thread_id] = ThreadJson(
                thread_id=thread_id,
                title=title
            )

    if include_history:

        turns_query = '''
        SELECT 
            tu.thread_id, 
            tu.message AS turn_message,
            tu.created_at AS turn_created_at
        FROM turns tu
        ORDER BY tu.id
        '''
        async with db.execute(turns_query) as cursor:
            turn_rows = await cursor.fetchall()

        thread_histories: dict[str, list[PachaTurn]] = {}
        for row in turn_rows:
            thread_id, turn_message, turn_created_at = row

            if thread_id not in thread_histories:
                thread_histories[thread_id] = []

            if turn_message:
                turn = from_turn_json(turn_message)
                thread_histories[thread_id].append(turn)

        artifacts_query = '''
        SELECT
            a.thread_id,
            a.artifact_id,
            a.artifact_json,
            a.created_at
        FROM artifacts a
        ORDER BY a.id
        '''
        async with db.execute(artifacts_query) as cursor:
            artifact_rows = await cursor.fetchall()

        artifacts: dict[str, Artifacts] = {}
        for row in artifact_rows:
            thread_id, artifact_id, artifact_json, created_at = row

            if thread_id not in artifacts:
                artifacts[thread_id] = Artifacts()

            if artifact_json:
                artifact = from_artifact_json(artifact_json)
                artifacts[thread_id].artifacts[artifact_id] = artifact

        user_confirmations_query = '''
        SELECT
            uc.thread_id,
            uc.confirmation_id,
            uc.status,
            uc.created_at
        FROM user_confirmations uc
        ORDER BY uc.id
        '''
        async with db.execute(user_confirmations_query) as cursor:
            user_confirmation_rows = await cursor.fetchall()

        user_confirmations: dict[str, list[UserConfirmationStatus]] = {}
        for row in user_confirmation_rows:
            thread_id, confirmation_id, status, created_at = row

            if thread_id not in user_confirmations:
                user_confirmations[thread_id] = []

            if confirmation_id and status:
                confirmation = UserConfirmationStatus(
                    confirmation_id=confirmation_id,
                    status=status
                )
                user_confirmations[thread_id].append(confirmation)

        for thread_id in threads:
            threads[thread_id]['history'] = [to_turn_json(
                turn, artifacts[thread_id]) for turn in thread_histories.get(thread_id, [])]
            threads[thread_id]['artifacts'] = [artifact.to_json()
                                               for artifact in artifacts.get(thread_id, Artifacts()).artifacts.values()]
            threads[thread_id]['user_confirmations'] = [to_user_confirmation_status_json(
                userconfirm) for userconfirm in user_confirmations.get(thread_id, [])]

    return list(threads.values())


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
