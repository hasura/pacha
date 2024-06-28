from examples.utils.io import *
from examples.utils.cli import add_data_engine_args, get_data_engine
from pacha.sdk.chat import PachaChat
from pacha.query_planner import QueryPlanner
import pacha.utils.llm.llama as llama
from pacha.utils.logging import setup_logger as setup_pacha_logger
import argparse
import os


def main():
    log_level = os.environ.get('LOG', 'WARNING').upper()
    setup_pacha_logger(log_level)

    parser = argparse.ArgumentParser(
        description='Chat against DDN using Pacha Chat SDK')

    add_data_engine_args(parser)
    args = parser.parse_args()
    data_engine = get_data_engine(args)

    pacha_chat = PachaChat(
        query_planner=QueryPlanner(
            data_engine=data_engine,
            hooks=get_query_planner_hooks_for_rendering_to_stdout()
        ),
        chat_llm=llama.LlamaOnTogether()
    )

    output("=== Pacha Chat ===", Colors.RED)
    print("Press double Enter after you are done entering your query.\n")

    while True:
        user_query = multi_line_input("User", USER_INPUT_COLOR)
        response = pacha_chat.chat(user_query)
        output("Assistant", ASSISTANT_RESPONSE_COLOR, response.llm_response)


if __name__ == "__main__":
    main()
