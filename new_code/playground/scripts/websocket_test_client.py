import asyncio
from pydantic import RootModel
import websockets
import json

from promptql_playground import protocol


async def websocket_client():
    # This is for continuing an existing thread.
    # uri = "ws://localhost:5000/threads/865d85e4-c78c-4e14-9487-5ea5cb40d836/continue"

    # Ths is for starting a new thread
    uri = "ws://localhost:5000/threads/start"
    async with websockets.connect(uri) as websocket:
        # Send a message
        message = {"type": "client_init", "version": "v1",
                   "ddn_headers": {"x-hasura-role": "admin"}}
        await websocket.send(json.dumps(message))
        message = {"type": "user_message",
                   "message": "issue $10 in credits to the latest project"}
        await websocket.send(json.dumps(message))

        try:
            # Receive a message
            while True:
                response = await websocket.recv()
                print(f"Received: {response}")
                server_message = RootModel[protocol.ServerMessage].model_validate_json(
                    response).root
                if isinstance(server_message, protocol.UserConfirmationRequest):
                    await websocket.send(json.dumps({"type": "user_confirmation_response", "response": "approve", "confirmation_request_id": str(server_message.confirmation_request_id)}))
        except websockets.exceptions.ConnectionClosedOK:
            pass


def main():
    # Run the client
    asyncio.run(websocket_client())


if __name__ == "__main__":
    main()
