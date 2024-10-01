from dataclasses import dataclass, field
from typing import Any, Optional, override
from promptql.artifacts import Artifact
from promptql.llm import Tool
from promptql.sql.catalog import Catalog
from promptql.system_prompt import PromptQlOptions, get_promptql_description

DEFAULT_TOOL_NAME = "execute_python"
CODE_ARGUMENT_NAME = "python_code"

CODE_ARGUMENT_DESCRIPTION = """
The python code to execute. This must be Python code and not direct SQL. 
"""

ARTIFACT_RENDERING_INSTRUCTIONS = """
Any data or synthesized response that might be useful to reference later - either when talking to the user or for follow-up processing should be stored as an artifact.
When referenced in the response, artifacts are rendered with a special user-friendly UI. So, whenever presenting data to the user, always put it in an artifact.

When responding to the user with data which lives in an artifact, you can reference the artifact using an <artifact /> tag, with `identifier` being an attribute.
Eg: If you created an artifact called 'most_recent_articles' and wanted to respond to the user with that data, you would respond like this:

Here are the 100 most recent articles I retrieved:
<artifact identifier = 'most_recent_articles' warning = 'I cannot see the full data so I must not make up observations' />

This tag will be replaced by the actual artifact data when showed to the user. So do not repeat or summarize the data from in your response.
Remember you yourself can't see the artifact, except what you printed from the python code, so any analysis on the artifact should be done in Python by reading the artifact, computing metrics, and printing the information.

For follow up questions, read or process the data from the artifact itself, instead of querying it again from the database. This is important because the user is viewing the artifact and so will refer to data in the artifact as it is.

Do not write very big python programs that do a lot of work. Instead, break them down into smaller programs (storing intermediate results in artifacts if needed), executing them, observing the output to see if it doing what you expect, and keeping the user informed on the progress.
"""

def build_tool_description(options: PromptQlOptions) -> str:
    return f"""
This tool can be used to write Python scripts to retrieve data from the user's database, process data{', or manipulate artifacts' if options.enable_artifacts else ''}.
Always ensure that there is at least one `executor.print`{' or `executor.store_artifact` ' if options.enable_artifacts and options.enable_artifact_rendering else ' '}call.
"""

@dataclass
class PromptQlTool(Tool):
    tool_name: str = DEFAULT_TOOL_NAME
    options: PromptQlOptions = field(default_factory=PromptQlOptions)
    custom_promptql_examples: Optional[str] = None

    @override
    def name(self) -> str:
        return self.tool_name

    @override
    def input_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                CODE_ARGUMENT_NAME: {
                    "type": "string",
                    "description": CODE_ARGUMENT_DESCRIPTION
                },
            },
            "required": [CODE_ARGUMENT_NAME],
        }

    @override
    def description(self) -> str:
        return build_tool_description(self.options)

    def system_prompt_fragment(self, artifacts: list[Artifact], catalog: Catalog) -> str:
        post_example_instructions = ARTIFACT_RENDERING_INSTRUCTIONS if self.options.enable_artifact_rendering else None
        return get_promptql_description(self.options,
                                        post_example_instructions=post_example_instructions,
                                        promptql_examples=self.custom_promptql_examples,
                                        artifacts=artifacts,
                                        catalog=catalog)
