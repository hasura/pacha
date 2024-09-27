from fastapi import WebSocket
import json
import asyncio
from typing import List, Dict
from pacha.utils.logging import setup_logger, get_logger

mock_responses = [
    {"type": "llm_call"},
    {"type": "assistant_response", "response_chunk": "Assistent response 1"},
    {"type": "assistant_response", "response_chunk": "Assistent response 2"},
    {
        "type": "assistant_response",
        "response_chunk": "test with code",
        "code_chunk": "sql = '\n",
    },
    {"type": "assistant_response", "code_chunk": "..."},
    {"type": "executing_code"},
    {"type": "code_output", "output_chunk": "user_id of abhinav@hasura.io is 1234"},
    {"type": "code_error", "error": "unknown table 'project'"},
    {"type": "llm_call"},
    {"type": "assistant_response", "response_chunk": "Apologies, let me fix the error"},
    {"type": "assistant_response", "code_chunk": "..."},
    {"type": "assistant_response", "code_chunk": "..."},
    {"type": "executing_code"},
    {"type": "code_output", "output_chunk": "project_id of abhinav@hasura.io is 5678"},
    {"type": "artifact_update", "artifact": {"type": "table", "data": {...}}},
    {"type": "code_output", "output_chunk": "issuing credits..."},
    {"type": "user_confirmation_request", "message": "SELECT * FROM IssueCredits(...)"},
    {"type": "completion"},
]


async def websocket_endpoint(websocket: WebSocket, thread_id: str = None):
    await websocket.accept()

    if thread_id:
        get_logger().info(f"Thread ID: {thread_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"Received message: {message}")
            if "message" in message:
                user_message = message["message"]
                # Send a response from responses list in every x seconds
                for i in mock_responses:
                    await asyncio.sleep(1)
                    response = i
                    await websocket.send_json(response)
            await websocket.close()

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        await websocket.close()
