from typing import Sequence
import aiosqlite
import json


from pacha.sdk.chat import Turn
from pacha.data_engine.artifacts import Artifacts, Artifact
from examples.chat_server.chat_json import to_turn_json, from_turn_json, from_artifact_json


async def fetch_thread_ids(db: aiosqlite.Connection):
    try:
        cursor = await db.execute("SELECT thread_id FROM threads order by created_at desc")
        rows = await cursor.fetchall()
        return [row[0] for row in rows]
    finally:
        await cursor.close()


async def persist_thread_id(db: aiosqlite.Connection, thread_id: str):
    try:
        query = f'''INSERT INTO threads (thread_id)
                                    VALUES ('{thread_id}');'''
        cursor = await db.execute(query)
    finally:
        await cursor.close()


async def persist_turn(db: aiosqlite.Connection, thread_id: str, turn: Turn, artifacts: Artifacts):
    try:
        cursor = await db.execute('''INSERT INTO turns (thread_id, message)
                            VALUES (?, ?);''', (thread_id, json.dumps(to_turn_json(turn, artifacts))))
    finally:
        await cursor.close()


async def persist_turn_many(db: aiosqlite.Connection, thread_id: str, turns: Sequence[Turn], artifacts: Artifacts):
    try:
        params = [{'message': json.dumps(to_turn_json(
            msg, artifacts))} for msg in turns]
        cursor = await db.executemany(f'''INSERT INTO turns (thread_id, message)
                                VALUES  ('{thread_id}', :message);''', params)
    finally:
        await cursor.close()


async def persist_artifacts(db: aiosqlite.Connection, thread_id: str, artifacts: dict[str, Artifact]):
    try:
        artifact_params = [{'artifact_id': artifact.identifier, 'artifact_json': json.dumps(artifact.to_json())}
                           for artifact in artifacts.values()]
        cursor = await db.executemany(f'''INSERT INTO artifacts (thread_id, artifact_id, artifact_json)
                              VALUES ('{thread_id}', :artifact_id, :artifact_json);''', artifact_params)
    finally:
        await cursor.close()


async def fetch_thread_id(db: aiosqlite.Connection, thread_id: str) -> aiosqlite.Row | None:
    try:
        cursor = await db.execute("SELECT thread_id from threads where thread_id = ?", (thread_id,))
        thread = await cursor.fetchone()
        return thread
    finally:
        await cursor.close()


async def fetch_turns(db: aiosqlite.Connection, thread_id: str) -> list[Turn]:
    try:
        cursor = await db.execute(
            "SELECT message FROM turns WHERE thread_id = ? ORDER BY turn_id", (thread_id,))
        turn_rows = await cursor.fetchall()
        turns: list[Turn] = []
        for turn_row in turn_rows:
            turn = from_turn_json(turn_row[0])
            turns.append(turn)
        return turns
    finally:
        await cursor.close()


async def fetch_artifacts(db: aiosqlite.Connection, thread_id: str) -> dict[str, Artifact]:
    try:
        cursor = await db.execute(
            "SELECT artifact_json FROM artifacts WHERE thread_id = ? order by id", (thread_id,))
        artifact_rows = await cursor.fetchall()
        artifacts: dict[str, Artifact] = {}
        for artifact_row in artifact_rows:
            artifact = from_artifact_json(artifact_row[0])
            artifacts[artifact.identifier] = artifact
        return artifacts
    finally:
        await cursor.close()
