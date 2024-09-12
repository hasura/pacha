from gql.transport.requests import RequestsHTTPTransport
from gql import gql, Client
import traceback
from dataclasses import dataclass, field, asdict
from typing import Any, Optional, TypedDict, NotRequired, cast
from pacha.data_engine.data_engine import DataEngine
from pacha.sdk.tool import Tool, ToolOutput
from graphql import parse
from graphql import validate
from graphql.utilities import print_schema, build_client_schema

GRAPHQL_ARGUMENT_NAME = "graphql"

TOOL_DESCRIPTION = """
This tool can be used to run GraphQL queries against the user's API.
"""

GRAPHQL_ARGUMENT_DESCRIPTION = """
The GRAPHQL query to execute.
"""

SYSTEM_PROMPT_FRAGMENT_TEMPLATE = """
The schema of the API available using the "{tool_name}" tool is as follows.

{schema}
"""


class HasuraConnection:
    def __init__(self, graphql_endpoint=None, secret=None, additional_headers={}):
        self.client = self.get_client(
            graphql_endpoint, secret, additional_headers)
        # self.client.connect_sync()
        # self.schema = self.client.schema
        # self.client.close_sync()
        self.schema_obj, self.schema = self.get_schema()

    def get_client(self, graphql_endpoint, secret, additional_headers):
        """Fetches Hasura client"""
        gql_headers = {'hasura_cloud_pat': secret}
        gql_headers.update(additional_headers)

        # Create a GraphQL client with the request transport
        transport = RequestsHTTPTransport(
            url=graphql_endpoint,
            headers=gql_headers)

        client = Client(transport=transport,
                        fetch_schema_from_transport=False)

        return client

    def execute_query(self, query):
        """Executes Hasura GraphQL query and returns result and status"""
        gql_query = gql(query)
        result = self.client.execute(gql_query)
        return result

    def validate_query(self, query):
        """"Validates Hasura GraphQL query and returns validation result"""
        result_err = []
        gql_query = gql(query)
        result_err = validate(schema=self.schema_obj,
                              document_ast=gql_query)
        return result_err

    def get_schema(self):
        introspection_query = gql("""
                                query {
                                __schema {
                                    queryType { name }
                                    mutationType { name }
                                    subscriptionType { name }
                                    types {
                                    ...FullType
                                    }
                                    directives {
                                    name
                                    description
                                    args {
                                        ...InputValue
                                    }
                                    locations
                                    }
                                }
                                }

                                fragment FullType on __Type {
                                kind
                                name
                                description
                                fields(includeDeprecated: true) {
                                    name
                                    description
                                    args {
                                    ...InputValue
                                    }
                                    type {
                                    ...TypeRef
                                    }
                                    isDeprecated
                                    deprecationReason
                                }
                                inputFields {
                                    ...InputValue
                                }
                                interfaces {
                                    ...TypeRef
                                }
                                enumValues(includeDeprecated: true) {
                                    name
                                    description
                                    isDeprecated
                                    deprecationReason
                                }
                                possibleTypes {
                                    ...TypeRef
                                }
                                }

                                fragment InputValue on __InputValue {
                                name
                                description
                                type { ...TypeRef }
                                defaultValue
                                }

                                fragment TypeRef on __Type {
                                kind
                                name
                                ofType {
                                    kind
                                    name
                                    ofType {
                                    kind
                                    name
                                    ofType {
                                        kind
                                        name
                                    }
                                    }
                                }
                                }

                                """)
        result = self.client.execute(introspection_query)
        introspection_data = result if 'data' not in result else result['data']
        graphql_schema = build_client_schema(
            introspection_data)  # type: ignore
        return graphql_schema, print_schema(graphql_schema)

    def _get_type(self, field_obj):
        if hasattr(field_obj, 'type'):
            if hasattr(field_obj.type, 'name'):
                return field_obj.type.name
            else:
                if hasattr(field_obj.type.of_type, 'name'):
                    return field_obj.type.of_type.name
                elif hasattr(field_obj.type.of_type, 'of_type'):
                    return field_obj.type.of_type.of_type.name
        # Field type
        elif hasattr(field_obj, 'of_type'):
            return field_obj.of_type.name


@dataclass
class GraphQlToolOutput(ToolOutput):
    output: str
    error: Optional[str] = None

    def get_response(self) -> str:
        response = ""
        if self.output is not None:
            response += str(self.output)
        if self.error is not None:
            response += str(self.error)
        return response

    def get_error(self) -> Optional[str]:
        return self.error


@dataclass
# Do not construct directly, use create_graphql_tool instead.
class PachaGraphQlTool(Tool):
    client: HasuraConnection
    schema: str = field(init=False)

    def name(self) -> str:
        return 'execute_graphql'

    async def execute(self, input, context) -> GraphQlToolOutput:
        graphql = input[GRAPHQL_ARGUMENT_NAME]
        try:
            return GraphQlToolOutput(output=str(self.client.execute_query(graphql)))
        except Exception as e:
            return GraphQlToolOutput(output=str(e), error=str(e))

    def input_schema(self):
        return {
            "type": "object",
            "properties": {
                GRAPHQL_ARGUMENT_NAME: {
                    "type": "string",
                    "description": GRAPHQL_ARGUMENT_DESCRIPTION
                },
            },
            "required": [GRAPHQL_ARGUMENT_NAME],
        }

    def description(self) -> str:
        return TOOL_DESCRIPTION

    def system_prompt_fragment(self, artifacts) -> str:
        return SYSTEM_PROMPT_FRAGMENT_TEMPLATE.format(tool_name=self.name(), schema=self.schema)

    def input_as_text(self, input) -> str:
        return input.get(GRAPHQL_ARGUMENT_NAME, "")


async def create_graphql_tool(*args, **kwargs) -> PachaGraphQlTool:
    tool = PachaGraphQlTool(*args, **kwargs)
    tool.schema = tool.client.get_schema()[1]
    return tool
