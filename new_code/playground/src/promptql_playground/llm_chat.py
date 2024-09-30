from promptql import PromptQlTool
from promptql.llm import Llm, UserTurn, ToolResponseTurn, AssistantTurn, Chat, ToolCallResponse, ToolOutput
from promptql_playground.thread import ThreadState


async def get_assistant_turn(llm: Llm, thread: ThreadState, system_prompt: str, tool: PromptQlTool) -> AssistantTurn:
    chat = Chat(system_prompt=system_prompt)
    for i in range(len(thread.interactions)):
        is_current_interaction = (i + 1 == len(thread.interactions))
        interaction = thread.interactions[i]
        chat.add_turn(UserTurn(text=interaction.user_message.message))

        for action in interaction.assistant_actions:
            assistant_turn = AssistantTurn(text=action.message)
            if action.code is not None:
                assistant_turn.tool_calls.append(
                    action.code.internal_tool_call)
            chat.add_turn(assistant_turn)
            if action.code is not None:
                has_error = False
                tool_output = ""
                if action.code.output is not None:
                    tool_output = action.code.output
                if action.code.error is not None:
                    tool_output += action.code.error
                    has_error = True
                if action.code.execution_end_timestamp is None:
                    tool_output += "\nInterrupted when calling tool"
                    has_error = True

                tool_response = ToolCallResponse(call_id=action.code.internal_tool_call.call_id, output=ToolOutput(
                    output=tool_output, has_error=has_error))
                chat.add_turn(ToolResponseTurn(
                    tool_responses=[tool_response]))

        if not is_current_interaction and interaction.completion_timestamp is None:
            # There was an interruption during this interaction. We need to ensure that the Chat object always ends in an AssistantTurn.
            last_turn = chat.turns[-1]
            dummy_assistant_message = interaction.error if interaction.error is not None else "Internal error: Assistant interrupted"
            if isinstance(last_turn, AssistantTurn):
                if last_turn.text is None:
                    last_turn.text = ""
                last_turn.text += f"\n{dummy_assistant_message}"
            else:
                chat.add_turn(AssistantTurn(text=dummy_assistant_message))
    return await llm.get_assistant_turn(chat, tools=[tool])
