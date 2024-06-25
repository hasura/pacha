import argparse

from pacha.data_engine.data_engine import DataEngine
from pacha.data_engine.ddn import DdnDataEngine
from pacha.data_engine.postgres import PostgresDataEngine


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
