from dataclasses import dataclass, field, asdict
from typing import Optional, TypedDict, NotRequired, cast
from pacha.data_engine.catalog import Catalog
from pacha.data_engine.data_engine import DataEngine, SqlOutput
from pacha.sdk.tool import Tool, ToolOutput

SQL_ARGUMENT_NAME = "sql"

TOOL_DESCRIPTION = """
This tool can be used to run SQL queries against the user's database.
"""

SQL_ARGUMENT_DESCRIPTION = """
The SQL query to execute.
"""

SYSTEM_PROMPT_FRAGMENT_TEMPLATE = """
The schema of the database available using the "{tool_name}" tool is as follows.

{catalog}
"""


def get_system_prompt_fragment(tool_name: str, catalog: Catalog) -> str:
    return SYSTEM_PROMPT_FRAGMENT_TEMPLATE.format(
        tool_name=tool_name, catalog=catalog)


@dataclass
class SqlToolOutput(ToolOutput):
    output: Optional[SqlOutput] = None
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
# Do not construct directly, use create_sql_tool instead.
class PachaSqlTool(Tool):
    data_engine: DataEngine
    catalog: Catalog = field(init=False)

    def name(self) -> str:
        return 'execute_sql'

    async def execute(self, input, context) -> SqlToolOutput:
        sql = input[SQL_ARGUMENT_NAME]
        try:
            return SqlToolOutput(output=await self.data_engine.execute_sql(sql))
        except Exception as e:
            return SqlToolOutput(error=str(e))

    def input_schema(self):
        return {
            "type": "object",
            "properties": {
                SQL_ARGUMENT_NAME: {
                    "type": "string",
                    "description": SQL_ARGUMENT_DESCRIPTION
                },
            },
            "required": [SQL_ARGUMENT_NAME],
        }

    def description(self) -> str:
        return TOOL_DESCRIPTION

    def system_prompt_fragment(self, artifacts) -> str:
        return SYSTEM_PROMPT_FRAGMENT_TEMPLATE.format(tool_name=self.name(), catalog=self.catalog.render_for_prompt())

    def input_as_text(self, input) -> str:
        return input.get(SQL_ARGUMENT_NAME, "")

async def create_sql_tool(*args, **kwargs) -> PachaSqlTool:
    tool = PachaSqlTool(*args, **kwargs)
    tool.catalog = await tool.data_engine.get_catalog()
    return tool