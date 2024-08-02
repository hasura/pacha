from dataclasses import dataclass
from pacha.query_planner.query_planner import QueryPlanner, QueryPlanningInput
from pacha.query_planner.input import UserTurn
from pacha.sdk.tools.tool import Tool

QUERY_ARGUMENT_NAME = "query"


@dataclass
class PachaNlTool(Tool):
    query_planner: QueryPlanner

    def name(self) -> str:
        return 'pacha'

    def execute(self, input) -> str:
        input_query = input[QUERY_ARGUMENT_NAME]
        data_context = self.query_planner.get_data_context(
            QueryPlanningInput([UserTurn(input_query)]))
        return "No contextual data" if data_context.data is None else data_context.data.output

    def input_schema(self):
        return {
            "type": "object",
            "properties": {
                QUERY_ARGUMENT_NAME: {
                    "type": "string",
                    "description": "The query in English for retrieving corresponding data. Include as much context in the query from the conversation history as required."
                },
            },
            "required": [QUERY_ARGUMENT_NAME],
        }

    def description(self) -> str:
        return "Use this tool to retrieve any contextual data relevant to the conversation."

    def system_prompt_fragment(self) -> str:
        return ""
    
    def input_as_text(self, input) -> str:
        return input.get(QUERY_ARGUMENT_NAME, "")
