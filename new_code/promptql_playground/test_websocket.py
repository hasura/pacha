import asyncio
from pydantic import RootModel
import websockets
import json

from promptql_playground.chat_server import protocol

async def websocket_client():
    uri = "ws://localhost:5000/send_message"  # Adjust the URI if needed
    async with websockets.connect(uri) as websocket:
        # Send a message
        message = {"type": "client_init", "version": "v1"}
        await websocket.send(json.dumps(message))
        print(f"Sent: {message}")
        message = {"type": "user_message", "message": "issue $10 in credits to the most recent project"}
        await websocket.send(json.dumps(message))
        print(f"Sent: {message}")

        # Receive a message
        while True:
            response = await websocket.recv()
            print(f"Received: {response}")
            server_message = RootModel[protocol.ServerMessage].model_validate_json(response).root
            if isinstance(server_message, protocol.UserConfirmationRequest):
                await websocket.send(protocol.UserConfirmationResponse(type='user_confirmation_response', response='approve').model_dump_json())
            

# Run the client
asyncio.run(websocket_client())