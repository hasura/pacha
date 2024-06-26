import argparse
from anthropic import Anthropic
from anthropic.types import Message, MessageParam, ToolParam
from examples.utils.cli import add_tool_args, get_data_engine
from pacha.query_planner import QueryPlanner
from examples.utils.io import (
    get_python_executor_hooks_for_rendering_to_stdout, output, multi_line_input, Colors, get_query_planner_hooks_for_rendering_to_stdout,
    ASSISTANT_RESPONSE_COLOR, QUERY_PLAN_COLOR, USER_INPUT_COLOR
)
import logging
from pacha.sdk.tools import PachaNlTool, PachaPythonTool, PachaSqlTool, Tool
from pacha.utils.logging import setup_logger as setup_pacha_logger
import os

MODEL = "claude-3-5-sonnet-20240620"


PACHA_TOOL_NAME = "pacha"

Anthropic().messages.create(
    model="claude-3-5-sonnet-20240620",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, world"}
    ]
)


def get_pacha_tool(args) -> Tool:
    data_engine = get_data_engine(args)
    if args.tool == 'nl':
        return PachaNlTool(query_planner=QueryPlanner(
            data_engine=data_engine,
            hooks=get_query_planner_hooks_for_rendering_to_stdout()))
    elif args.tool == 'sql':
        return PachaSqlTool(data_engine=data_engine)
    elif args.tool == 'python':
        return PachaPythonTool(
            data_engine=data_engine, hooks=get_python_executor_hooks_for_rendering_to_stdout())
    else:
        print("Invalid tool choice")
        exit()


def main():
    log_level = os.environ.get('LOG', 'WARNING').upper()
    setup_pacha_logger(log_level)
    logging.getLogger(__name__).setLevel(log_level)

    parser = argparse.ArgumentParser(
        description='Chat against data via Anthropic using Pacha Tool SDK')
    add_tool_args(parser)

    args = parser.parse_args()

    pacha_tool = get_pacha_tool(args)
    pacha_tool_param: ToolParam = {
        "name": PACHA_TOOL_NAME,
        "description": pacha_tool.description(),
        "input_schema": pacha_tool.input_schema()
    }

    system_prompt = f"""
    You are a helpful assistant. If needed, use the "{PACHA_TOOL_NAME}" tool to retrieve any contextual user data relevant to the conversation.
    {pacha_tool.system_prompt_fragment(PACHA_TOOL_NAME)}
    """

    client = Anthropic()
    messages: list[MessageParam] = []

    output("=== Anthropic Chat with Pacha tool ===", Colors.RED)
    print("Press double Enter after you are done entering your query.\n")

    user_input = multi_line_input("User", USER_INPUT_COLOR)
    user_message: MessageParam = {
        "role": "user",
        "content": [{
            "type": "text",
            "text": user_input,
        }],
    }
    messages.append(user_message)

    while True:
        logging.getLogger(__name__).info("Calling Assistant...")
        model_response: Message = client.messages.create(
            max_tokens=1024,
            messages=messages,
            model=MODEL,
            tools=[pacha_tool_param],
            system=system_prompt,
        )
        messages.append({
            "role": "assistant",
            "content": model_response.content
        })

        user_content = []
        for content in model_response.content:
            if content.type == "text":
                output("Assistant", ASSISTANT_RESPONSE_COLOR,
                       content.text)
            elif content.type == "tool_use":
                if content.name == PACHA_TOOL_NAME:
                    output("Pacha Input", QUERY_PLAN_COLOR, str(content.input))

                    pacha_result = pacha_tool.execute(
                        content.input)

                    output("Pacha Output", QUERY_PLAN_COLOR,
                           pacha_result.get_response())

                    user_content.append({
                        "type": "tool_result",
                        "tool_use_id": content.id,
                        "content": [{"type": "text", "text": pacha_result.get_response()}],
                        "is_error": pacha_result.get_error() is not None
                    })
                else:
                    output("Error", Colors.RED, "Invalid tool call")
                    raise Exception("Invalid tool call")
        if len(user_content) == 0:
            user_input = multi_line_input("User", USER_INPUT_COLOR)
            user_content.append({
                "type": "text",
                "text": user_input
            })
        messages.append({
            "role": "user",
            "content": user_content
        })


if __name__ == "__main__":
    main()
