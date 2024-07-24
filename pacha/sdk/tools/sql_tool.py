from dataclasses import dataclass, field
from typing import Optional
from pacha.data_engine.catalog import Catalog, render_catalog
from pacha.data_engine.data_engine import DataEngine, SqlOutput
from pacha.utils.tool import Tool, ToolOutput

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
class PachaSqlTool(Tool):
    data_engine: DataEngine
    catalog: Catalog = field(init=False)

    def __post_init__(self):
        self.catalog = self.data_engine.get_catalog()

    def name(self) -> str:
        return 'pacha'

    def execute(self, input) -> SqlToolOutput:
        sql = input[SQL_ARGUMENT_NAME]
        try:
            return SqlToolOutput(output=self.data_engine.execute_sql(sql))
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

    def system_prompt_fragment(self) -> str:
        return SYSTEM_PROMPT_FRAGMENT_TEMPLATE.format(tool_name=self.name(), catalog=self.catalog.render_for_prompt())
    
    def input_as_text(self, input) -> str:
        return input.get(SQL_ARGUMENT_NAME, "")
