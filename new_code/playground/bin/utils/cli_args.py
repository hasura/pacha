import argparse
from dataclasses import dataclass
import os
from typing import Optional

from promptql.llm import Llm
from promptql.llms import openai, anthropic
from promptql.sql import DdnSqlEngine

from promptql_playground.config import PromptQlConfig





def add_promptql_config_args(parser: argparse.ArgumentParser):
    parser.add_argument('-u', '--url',
                        help="Hasura DDN SQL endpoint URL", type=str)
    parser.add_argument('-H', '--header', dest='headers', type=str, action='append', default=[],
                        help='Headers to pass during the Hasura DDN request')
    parser.add_argument('--llm', type=str,
                        choices=['openai', 'anthropic'], default='anthropic')


def build_promptql_config(args: argparse.Namespace) -> PromptQlConfig:
    if args.llm == 'openai':
        llm = openai.OpenAI()
    elif args.llm == 'anthropic':
        llm = anthropic.Anthropic(max_retries=5)
    else:
        print("Invalid LLM choice")
        exit(1)
    headers_dict = {}
    for header in args.headers:
        header: str = header
        header_name, header_value = header.split(':', 1)
        headers_dict[header_name] = header_value.lstrip()

    promptql_uri = os.environ.get("PROMPTQL_URI", None)
    if promptql_uri is None:
        print("PROMPTQL_URI env var is not set")
        exit(1)

    return PromptQlConfig(
        llm=llm,
        ddn_url=args.url,
        ddn_headers=headers_dict,
        promptql_uri=promptql_uri,
        promptql_secret_key=os.environ.get("PROMPTQL_SECRET_KEY", None))
