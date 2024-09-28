import asyncio
from pydantic import RootModel
import websockets
import json

from promptql_playground import protocol


async def websocket_client():
    # uri = "ws://localhost:5000/threads/865d85e4-c78c-4e14-9487-5ea5cb40d836/continue"
    uri = "ws://localhost:5000/threads/start"
    async with websockets.connect(uri) as websocket:
        # Send a message
        message = {"type": "client_init", "version": "v1"}
        await websocket.send(json.dumps(message))
        message = {"type": "user_message",
                   "message": "issue $10 in credits to the latest project"}
        await websocket.send(json.dumps(message))

        # Receive a message
        while True:
            response = await websocket.recv()
            print(f"Received: {response}")
            try:
                server_message = RootModel[protocol.ServerMessage].model_validate_json(
                    response).root
                if isinstance(server_message, protocol.UserConfirmationRequest):
                    pass
                    # await websocket.send(protocol.UserConfirmationResponse(type='user_confirmation_response', response='deny', confirmation_request_id=server_message.confirmation_request_id).model_dump_json())
            except:
                pass


# Run the client
asyncio.run(websocket_client())
