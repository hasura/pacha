from fastapi import WebSocket
import json
import asyncio
from typing import List, Dict
from pacha.utils.logging import setup_logger, get_logger

mock_responses = [
    {"type":"title_updated","title":"issue $10 in credits to the latest proje"},
    {"type":"accept_interaction","interaction_id":"579eaa64-1db3-4bef-a053-4ccab1fa9993"},
    {"type":"llm_call","assistant_action_id":"65fcb332-b368-466d-8283-2c9cce3d5cc0"},
    {"type":"assistant_message_response","assistant_action_id":"65fcb332-b368-466d-8283-2c9cce3d5cc0","message_chunk":"Certainly! I'd be happy to help you issue $10 in credits to the latest project. To do this, we'll need to use the `IssueCreditsOrRefund` function. However, we need some additional information to proceed. Let's gather the required data step by step.\n\nTo use the `IssueCreditsOrRefund` function, we need the following required parameters:\n1. amount (which we have: $10)\n2. email of the project's owner\n3. ownerId\n4. projectId\n\nWe'll need to fetch the latest project information first, and then we can issue the credits. Let's start by retrieving the latest project details."},
    {"type":"assistant_code_response","assistant_action_id":"65fcb332-b368-466d-8283-2c9cce3d5cc0","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","code_chunk":"# Fetch the latest project\nsql_query = \"\"\"\nSELECT \n    p.id AS project_id, \n    p.name AS project_name, \n    p.ownerId AS owner_id,\n    u.email AS owner_email\nFROM \n    app.Projects p\nJOIN \n    app.Users u ON p.ownerId = u.id\nORDER BY \n    p.createdAt DESC\nLIMIT 1\n\"\"\"\n\nresult = executor.run_sql(sql_query)\n\nif len(result) == 0:\n    executor.print(\"No projects found.\")\nelse:\n    latest_project = result[0]\n    executor.print(f\"Latest Project Details:\")\n    executor.print(f\"Project ID: {latest_project['project_id']}\")\n    executor.print(f\"Project Name: {latest_project['project_name']}\")\n    executor.print(f\"Owner ID: {latest_project['owner_id']}\")\n    executor.print(f\"Owner Email: {latest_project['owner_email']}\")\n\n    # Store the project details as an artifact\n    executor.store_artifact(\n        'latest_project_details',\n        'Latest Project Details',\n        'table',\n        [latest_project]\n    )"},
    {"type":"executing_code","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"SQL statement returned 1 rows.\n"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Latest Project Details:\n"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Project ID: ad90f2bf-d9fc-4323-9894-9a719584fe2a\n"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Project Name: Kappa Solution\n"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Owner ID: 7144d918-e4c8-4de8-92a0-912137a48777\n"},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Owner Email: sean.russell@megacorp.com\n"},
    {"type":"artifact_update","artifact":{"identifier":"latest_project_details","title":"Latest Project Details","artifact_type":"table","data":[{"project_id":"ad90f2bf-d9fc-4323-9894-9a719584fe2a","project_name":"Kappa Solution","owner_id":"7144d918-e4c8-4de8-92a0-912137a48777","owner_email":"sean.russell@megacorp.com"}]}},
    {"type":"code_output","code_block_id":"6338ce32-b715-4bbf-ac4c-ccfcd1aa6e57","output_chunk":"Stored table artifact: identifier = 'latest_project_details', title = 'Latest Project Details', number of rows = 1, sample rows = [{'project_id': 'ad90f2bf-d9fc-4323-9894-9a719584fe2a', 'project_name': 'Kappa Solution', 'owner_id': '7144d918-e4c8-4de8-92a0-912137a48777', 'owner_email': 'sean.russell@megacorp.com'}]\n"},
    {"type":"llm_call","assistant_action_id":"fa4604b4-4290-4366-867d-a508f74f4d76"},
    {"type":"assistant_message_response","assistant_action_id":"fa4604b4-4290-4366-867d-a508f74f4d76","message_chunk":"Great! We've successfully retrieved the latest project details. Now we have all the information needed to issue the credits. Let's proceed with issuing $10 in credits to this project using the `IssueCreditsOrRefund` function."},
    {"type":"assistant_code_response","assistant_action_id":"fa4604b4-4290-4366-867d-a508f74f4d76","code_block_id":"d716e50b-b2eb-4cee-9387-793732d04f2f","code_chunk":"# Retrieve the latest project details from the artifact\nlatest_project = executor.get_artifact('latest_project_details')[0]\n\n# Call the IssueCreditsOrRefund function\nresult = executor.run_sql(f\"\"\"\nSELECT *\nFROM IssueCreditsOrRefund(\n  STRUCT(\n    10 as amount,\n    '{latest_project['owner_email']}' as email,\n    '{latest_project['owner_id']}' as ownerId,\n    '{latest_project['project_id']}' as projectId\n  )\n)\n\"\"\")\n\nif len(result) > 0:\n    status = result[0]['status']\n    invoice_id = result[0]['stripeInvoiceId']\n    executor.print(f\"Credit issue status: {status}\")\n    executor.print(f\"Stripe Invoice ID: {invoice_id}\")\nelse:\n    executor.print(\"No result returned from IssueCreditsOrRefund function.\")\n\n# Store the result as an artifact\nexecutor.store_artifact(\n    'credit_issue_result',\n    'Credit Issue Result',\n    'table',\n    result\n)"},
    {"type":"executing_code","code_block_id":"d716e50b-b2eb-4cee-9387-793732d04f2f"},
    {"type":"user_confirmation_request","message":"\nSELECT *\nFROM IssueCreditsOrRefund(\n  STRUCT(\n    10 as amount,\n    'sean.russell@megacorp.com' as email,\n    '7144d918-e4c8-4de8-92a0-912137a48777' as ownerId,\n    'ad90f2bf-d9fc-4323-9894-9a719584fe2a' as projectId\n  )\n)\n","confirmation_request_id":"5c3c46a8-5f44-493f-8b89-31718d564292"},
    {"type":"code_error","code_block_id":"d716e50b-b2eb-4cee-9387-793732d04f2f","error":"error in data fusion: External error: request to connector failed with status code N/A: error sending request for url (http://local.hasura.dev:6724/mutation): error trying to connect: tcp connect error: Connection refused (os error 111)"},
    {"type":"llm_call","assistant_action_id":"a26a8c8b-0525-437d-bfd7-508778602e63"},
    {"type":"assistant_message_response","assistant_action_id":"a26a8c8b-0525-437d-bfd7-508778602e63","message_chunk":"I apologize for the error that occurred while trying to issue the credits. It seems there was a problem connecting to the service that handles the credit issuance. This could be due to a temporary network issue or a problem with the service itself.\n\nSince we couldn't complete the credit issuance at this moment, here's what we know and what we can do:\n\n1. We successfully retrieved the latest project details:\n   - Project ID: ad90f2bf-d9fc-4323-9894-9a719584fe2a\n   - Project Name: Kappa Solution\n   - Owner ID: 7144d918-e4c8-4de8-92a0-912137a48777\n   - Owner Email: sean.russell@megacorp.com\n\n2. We attempted to issue $10 in credits to this project, but the operation couldn't be completed due to a connection error.\n\nGiven this situation, I recommend the following steps:\n\n1. We should inform you about the temporary inability to issue the credits.\n2. You may want to try again later when the service might be back up and running.\n3. If the problem persists, it would be advisable to contact the technical support team to report this issue.\n\nWould you like me to try issuing the credits again now, or would you prefer to attempt this operation later? Alternatively, if you have access to technical support, we could prepare a message detailing the issue for you to send to them."},
    {"type":"completion"}
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
                    await asyncio.sleep(0.5)
                    response = i
                    await websocket.send_json(response)
            await websocket.close()

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        await websocket.close()
