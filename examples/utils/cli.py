import argparse

from examples.utils.io import get_python_executor_hooks_for_rendering_to_stdout, get_query_planner_hooks_for_rendering_to_stdout
from pacha.data_engine.data_engine import DataEngine
from pacha.data_engine.ddn import DdnDataEngine
from pacha.data_engine.postgres import PostgresDataEngine
from pacha.query_planner.query_planner import QueryPlanner
from pacha.sdk.tool import Tool
from pacha.sdk.tools.code_tool import PachaPythonTool, create_python_tool
from pacha.sdk.tools.nl_tool import PachaNlTool
from pacha.sdk.tools.sql_tool import PachaSqlTool, create_sql_tool
from pacha.sdk.llms import openai, anthropic
from pacha.sdk.llm import Llm


def add_data_engine_args(parser: argparse.ArgumentParser):
    parser.add_argument('-d', '--data-engine', type=str,
                        choices=['ddn', 'postgres'], default='ddn')
    parser.add_argument('-u', '--url',
                        help="Hasura DDN SQL endpoint URL", type=str)
    parser.add_argument('-H', '--header', dest='headers', type=str, action='append', default=[],
                        help='Headers to pass during the Hasura DDN request')
    parser.add_argument('-c', '--connection-string',
                        help="postgres connection string", type=str)
    parser.add_argument('-s', '--include-schema', dest='included_schemas', type=str, action='append',
                        help='one or more schemas to include from the postgres database')


def get_data_engine(args: argparse.Namespace) -> DataEngine:
    if args.data_engine == 'postgres':
        return PostgresDataEngine(
            connection_string=args.connection_string,
            included_schemas=args.included_schemas)

    headers_dict = {}
    for header in args.headers:
        header: str = header
        header_name, header_value = header.split(':', 1)
        headers_dict[header_name] = header_value.lstrip()

    return DdnDataEngine(url=args.url, headers=headers_dict)


def add_tool_args(parser: argparse.ArgumentParser):
    add_data_engine_args(parser)
    parser.add_argument('-t', '--tool', type=str,
                        choices=['nl', 'sql', 'python'], default='python')


def add_auth_args(parser: argparse.ArgumentParser):
    parser.add_argument('-k', '--secret-key', type=str)


async def get_pacha_tool(args, render_to_stdout=True) -> Tool:
    data_engine = get_data_engine(args)
    if args.tool == 'nl':
        return PachaNlTool(query_planner=QueryPlanner(
            data_engine=data_engine,
            hooks=get_query_planner_hooks_for_rendering_to_stdout()))
    elif args.tool == 'sql':
        return await create_sql_tool(data_engine=data_engine)
    elif args.tool == 'python':
        if render_to_stdout:
            return await create_python_tool(
                data_engine=data_engine, hooks=get_python_executor_hooks_for_rendering_to_stdout(), llm=get_llm(args))
        else:
            return await create_python_tool(data_engine=data_engine, llm=get_llm(args))
    else:
        print("Invalid tool choice")
        exit(1)


def add_llm_args(parser: argparse.ArgumentParser):
    parser.add_argument('--llm', type=str,
                        choices=['openai', 'anthropic'], default='anthropic')


def get_llm(args) -> Llm:
    if args.llm == 'openai':
        return openai.OpenAI()
    elif args.llm == 'anthropic':
        return anthropic.Anthropic(max_retries=5)
    print("Invalid LLM choice")
    exit(1)
