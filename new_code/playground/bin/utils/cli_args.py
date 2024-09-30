import argparse
from dataclasses import dataclass

from promptql.llm import Llm
from promptql.llms import openai, anthropic
from promptql.sql import DdnSqlEngine

@dataclass
class PromptQlConfig:
    llm: Llm
    ddn: DdnSqlEngine


def add_promptql_config_args(parser: argparse.ArgumentParser):
    parser.add_argument('-u', '--url',
                        help="Hasura DDN SQL endpoint URL", type=str)
    parser.add_argument('-H', '--header', dest='headers', type=str, action='append', default=[],
                        help='Headers to pass during the Hasura DDN request')
    parser.add_argument('--llm', type=str,
                        choices=['openai', 'anthropic'], default='anthropic')

def get_ddn_engine(args: argparse.Namespace) -> DdnSqlEngine:
    headers_dict = {}
    for header in args.headers:
        header: str = header
        header_name, header_value = header.split(':', 1)
        headers_dict[header_name] = header_value.lstrip()

    return DdnSqlEngine(url=args.url, headers=headers_dict)


def get_llm(args: argparse.Namespace) -> Llm:
    if args.llm == 'openai':
        return openai.OpenAI()
    elif args.llm == 'anthropic':
        return anthropic.Anthropic(max_retries=5)
    print("Invalid LLM choice")
    exit(1)

def build_promptql_config(args: argparse.Namespace) -> PromptQlConfig:
    return PromptQlConfig(llm=get_llm(args), ddn=get_ddn_engine(args))