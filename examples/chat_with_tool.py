import argparse
from examples.utils.cli import add_llm_args, add_tool_args, get_data_engine, get_llm, get_pacha_tool
from pacha.query_planner import QueryPlanner
from examples.utils.io import (
    get_python_executor_hooks_for_rendering_to_stdout, output, multi_line_input, Colors, get_query_planner_hooks_for_rendering_to_stdout,
    ASSISTANT_RESPONSE_COLOR, QUERY_PLAN_COLOR, USER_INPUT_COLOR
)
import logging
from pacha.sdk.tools import PachaNlTool, PachaPythonTool, PachaSqlTool
from pacha.utils.llm.types import Chat, ToolCallResponse, ToolResponseTurn, UserTurn
from pacha.utils.logging import setup_logger as setup_pacha_logger
import os

from pacha.utils.tool import Tool

def main():
    log_level = os.environ.get('LOG', 'WARNING').upper()
    setup_pacha_logger(log_level)

    parser = argparse.ArgumentParser(
        description='Chat against data via Anthropic using Pacha Tool SDK')
    add_tool_args(parser)
    add_llm_args(parser)
    args = parser.parse_args()
    pacha_tool = get_pacha_tool(args)
    llm = get_llm(args)

    system_prompt = f"""
    You are a helpful assistant. If needed, use the "{pacha_tool.name()}" tool to retrieve any contextual user data relevant to the conversation.
    {pacha_tool.system_prompt_fragment()}
    """

    output("=== Chat with Pacha tool ===", Colors.RED)
    print("Press double Enter after you are done entering your query.\n")

    chat = Chat(system_prompt=system_prompt)

    user_input = multi_line_input("User", USER_INPUT_COLOR)
    chat.add_turn(UserTurn(text=user_input))

    while True:
        logging.getLogger(__name__).info("Calling Assistant...")
        assistant_turn = llm.get_assistant_turn(
            chat, tools=[pacha_tool], temperature=0)
        chat.add_turn(assistant_turn)
        tool_call_responses = []
        if assistant_turn.text is not None:
            output("Assistant", ASSISTANT_RESPONSE_COLOR, assistant_turn.text)
        for tool_call in assistant_turn.tool_calls:
            if tool_call.name == pacha_tool.name():
                output("Pacha Input", QUERY_PLAN_COLOR, str(tool_call.input))
                tool_output = pacha_tool.execute(tool_call.input)
                output("Pacha Output", QUERY_PLAN_COLOR,
                       tool_output.get_response())
                tool_call_responses.append(ToolCallResponse(
                    call_id=tool_call.call_id, output=tool_output))
            else:
                output("Error", Colors.RED, "Invalid tool call")
                raise Exception("Invalid tool call")
        if len(tool_call_responses) == 0:
            user_input = multi_line_input("User", USER_INPUT_COLOR)
            chat.add_turn(UserTurn(text=user_input))
        else:
            chat.add_turn(ToolResponseTurn(calls=tool_call_responses))

if __name__ == "__main__":
    main()