import argparse
from openai import OpenAI
from openai.types.chat import (
    ChatCompletionSystemMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionUserMessageParam,
    ChatCompletionToolMessageParam,
    ChatCompletionToolParam,
)
from examples.utils.cli import add_tool_args, get_pacha_tool
from pacha.data_engine.postgres import PostgresDataEngine
from pacha.query_planner import QueryPlanner
from examples.utils.io import (
    get_python_executor_hooks_for_rendering_to_stdout, output, multi_line_input, Colors, get_query_planner_hooks_for_rendering_to_stdout,
    ASSISTANT_RESPONSE_COLOR, QUERY_PLAN_COLOR, USER_INPUT_COLOR
)
import logging
from pacha.sdk.tools import PachaNlTool, PachaPythonTool, PachaSqlTool, Tool
from pacha.utils.logging import setup_logger as setup_pacha_logger
from typing import cast
import json
import os

MODEL = "gpt-4-turbo"


PACHA_TOOL_NAME = "pacha"


def main():
    log_level = os.environ.get('LOG', 'WARNING').upper()
    setup_pacha_logger(log_level)
    logging.getLogger(__name__).setLevel(log_level)

    parser = argparse.ArgumentParser(
        description='Chat against data using Pacha Tool SDK')
    add_tool_args(parser)

    args = parser.parse_args()

    pacha_tool = get_pacha_tool(args)
    pacha_tool_param: ChatCompletionToolParam = {
        "type": "function",
        "function": {
            "name": PACHA_TOOL_NAME,
            "description": pacha_tool.description(),
            "parameters": pacha_tool.input_schema()
        }
    }

    system_prompt = f"""
    You are a helpful assistant. If needed, use the "{PACHA_TOOL_NAME}" tool to retrieve any contextual user data relevant to the conversation.
    {pacha_tool.system_prompt_fragment(PACHA_TOOL_NAME)}
    """

    system_message: ChatCompletionSystemMessageParam = {
        "role": "system",
        "content": system_prompt
    }

    client = OpenAI()

    messages: list[ChatCompletionMessageParam] = [system_message]

    output("=== OpenAI Chat with Pacha tool ===", Colors.RED)
    print("Press double Enter after you are done entering your query.\n")

    user_input = multi_line_input("User", USER_INPUT_COLOR)
    user_message: ChatCompletionUserMessageParam = {
        "role": "user",
        "content": user_input
    }
    messages.append(user_message)

    while True:
        logging.getLogger(__name__).info("Calling Assistant...")
        model_response = client.chat.completions.create(
            messages=messages,
            model=MODEL,
            tools=[pacha_tool_param]
        ).choices[0].message
        messages.append(cast(ChatCompletionMessageParam,
                        model_response.to_dict()))

        if model_response.content:
            output("Assistant", ASSISTANT_RESPONSE_COLOR,
                   model_response.content)

        if model_response.tool_calls:
            for tool_call in model_response.tool_calls:
                if tool_call.function.name == PACHA_TOOL_NAME:
                    pacha_input = json.loads(tool_call.function.arguments)
                    output("Pacha Input", QUERY_PLAN_COLOR, pacha_input)

                    pacha_output = pacha_tool.execute(
                        pacha_input).get_response()

                    output("Pacha Output", QUERY_PLAN_COLOR, pacha_output)

                    tool_message: ChatCompletionToolMessageParam = {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": pacha_output
                    }
                    messages.append(tool_message)
                else:
                    output("Error", Colors.RED, "Invalid tool call")
                    raise Exception("Invalid tool call")
        else:
            user_input = multi_line_input("User", USER_INPUT_COLOR)
            user_message: ChatCompletionUserMessageParam = {
                "role": "user",
                "content": user_input
            }
            messages.append(user_message)


if __name__ == "__main__":
    main()
