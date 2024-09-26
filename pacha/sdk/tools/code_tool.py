from dataclasses import dataclass, field, asdict
from typing import Optional, TypedDict, NotRequired, cast
from pacha.data_engine.artifacts import Artifacts
from pacha.data_engine.catalog import Catalog
from pacha.data_engine.context import ExecutionContext
from pacha.data_engine.data_engine import DataEngine, SqlStatement
from pacha.data_engine.python_executor import PythonExecutor, PythonExecutorHooks
from pacha.sdk.llm import Llm
from pacha.sdk.tools.sql_tool import SYSTEM_PROMPT_FRAGMENT_TEMPLATE
from pacha.sdk.tool import Tool, ToolOutput

CODE_ARGUMENT_NAME = "python_code"


@dataclass
class PythonOptions:
    enable_artifacts: bool
    enable_ai_primitives: bool


def build_tool_description(options: PythonOptions) -> str:
    return f"""
This tool can be used to write Python scripts to retrieve data from the user's database, process data{', or manipulate artifacts' if options.enable_artifacts else ''}.
Always ensure that there is at least one `executor.print`{' or `executor.store_artifact` ' if options.enable_artifacts else ' '}call.
"""


def build_python_methods(options: PythonOptions) -> str:
    methods = """
- `def run_sql(self, sql: str) -> list[dict[str, Any]]`:
  This can be used to retrieve data by issuing an Apache DataFusion style SQL query. It returns a list of rows, with each row represented as a dictionary of selected column names (or aliases) to column values.
  Account for the possibilty of rows not meeting your filters in your python code or nullable columns returning None.
  Keep the SQL easy to understand (eg: no sub-selects), doing more in Python if you need to, especially if SQL is throwing errors.
  Use COUNT(1) instead of COUNT(*), as the SQL engine doesn't support *.
  Never do a SELECT * but select only the columns you want.
  The python representations of various SQL types are:
  - any number-like types: int
  - any text-like types: str
  - DATE type: str (eg: '2024-08-14')
  - TIMESTAMP type: str (eg: '2024-08-14T13:58:26')
- `def print(self, text: str)`
  This can be used to print and observe anything from the Python script. This output will be visible to you only (not the user)."""

    if options.enable_artifacts:
        methods += """
  Do not use this to print large amounts of data, use artifacts instead. If the user asks for insights or analysis on artifact data, then you should print that data.
- `def store_artifact(self, identifier: str, title: str, artifact_type: 'table' | 'text', data)`:
  This can be used to store any retrieved / computed data in a tabular form, for referencing either when talking to the user or when.
  The `identifier` will be used to reference this artifact. If reusing an identifier, this overwrites the existing artifact.
  The `title` is a human friendly description of what the data contains.
  The `artifact_type` can either be 'table' or 'text' depending on the kind of artifact.
  The `data` contains the data to store in the artifact. The type of this argument depends on the `artifact_type`:
  - For 'table' artifacts, the data type is `list[dict[str, Any]]`: A list of rows, with each row represented as a dictionary of column names to column values. The column names and values must be user-friendly and there must be at least one row in the data.
  - For 'text' artifacts, the data type is `str`: Raw text (eg: text of a document).
- `def get_artifact(self, identifier: str) -> list[dict[str, Any]] | str`:
  This can be used to retrieve the `data` for an artifact that was previously created (even in an old invocation of this tool) using `store_table_artifact` for further processing or observation.
  The returned artifact data can also be modified (eg: to append rows or columns to it) and stored back.
  For follow-up questions, avoid retrieving the data from the database again if you can look it up in a previously created artifact."""

    if options.enable_ai_primitives:
        methods += """
- `def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]`:
  This can be used to call an AI language model to classify the given `inputs_to_classify` into the specified `categories`.
  If `allow_multiple` is True, then zero or more categories can be chosen for each input and hence the output is a list of list of categories - one list per input.
  If `allow_multiple` is False, then exactly one category is chosen for each input and the output is a list of categories - one per input.
  Any instructions for classification (eg: what the categories mean) should be clearly given in `instructions`. All the data needed for classification should be a part of `data` - the classification model cannot access any external data.
- `def summarize(self, instructions: str, input: str) -> str`:
  This can be used to call a language model to summarize the `input`. Any summarization instructions (eg: what information to preserve) must be given in `instructions`. The output is the summarized text.
"""
    return methods


CODE_ARGUMENT_DESCRIPTION = """
The python code to execute. This must be Python code and not direct SQL. 
"""


def build_python_examples(options: PythonOptions) -> str:
    examples = """
Example: Fetching the title of article with ID 5
 ```
data = executor.run_sql("SELECT title FROM library.articles WHERE id = 5")
if len(data) == 0:
  executor.print('not found')
else:
  executor.print(f'{data[0]["title"]}')
```

Example: Fetching the date of the oldest article
```
data = executor.run_sql("SELECT MIN(date) AS min_date FROM library.articles WHERE date >= '2023-01-1')
min_date = data[0][min_date]
executor.print(f'{min_date'})
```

Example: Calling a SQL function
```
data = executor.run_sql("SELECT greeting FROM HelloWorld(STRUCT('Hi' as greeting, 'Alice' as person, 5 as repeat_count)))
if len(data) != 5:
    executor.print('expected 5 rows')
else:
    for row in data:
        executor.print(row[greeting])
```"""

    if options.enable_artifacts:
        examples += """

Example: Fetching the 100 most recent articles and storing them in the artifact
```
import datetime
sql = \"""
    SELECT
        articles.id AS article_id,
        articles.title AS article_title,
        articles.content AS article_content,
        articles.published_at AS article_published_at,
        authors.first_name AS author_first_name
        authors.last_name AS author_last_name
    FROM
       library.articles AS articles
       JOIN library.authors AS authors ON articles.author_id = authors.id
    ORDER BY articles.published_at DESC
    LIMIT 100
\"""
data = executor.run_sql(sql)
if len(data) == 0:
  executor.print('no articles found')
else:
  artifact_data = []
  for row in data:
    artifact_row = {
      'ID': row['article_id'],
      'Title': row['article_title'],
      'Content': row['article_content'],
      'Published at': datetime.fromisoformat(row['article_published_at']).strftime("%B %d, %Y %I:%M %p"),
      'Author': row['author_first_name'] + ' ' + row['author_last_name']
    }
    artifact_data.append(artifact_row)
  # Store the articles as a tabular artifact, for easier consumption by the user
  executor.store_artifact('most_recent_articles', '100 most recent articles', 'table', artifact_data)
```"""

    if options.enable_ai_primitives:
        examples += """
Example: Filtering the previously retrieved articles to ones that might be considered controversial
```
# Get the previously retrieved data from the artifact
articles = executor.get_artifact('most_recent_articles')

# Prepare data for classification
article_contents = [article['content'] for article in articles]

# Define categories and instructions for controversy classification
categories = ['controversial', 'non-controversial']
instructions = \"""
Classify the given article content as either 'controversial' or 'non-controversial'.
Controversial articles typically contain topics that are likely to generate significant
debate, disagreement, or emotional responses. These may include sensitive political issues,
social controversies, or highly polarizing subjects. Non-controversial articles are generally
factual, neutral, or deal with less contentious topics.
\"""

# Perform classification
classifications = executor.classify(instructions, article_contents, categories)

# Filter controversial articles
controversial_indices = [i for i, classification in enumerate(classifications) if classification == 'controversial']
controversial_articles = [articles[i] for i in controversial_indices]

# store the controversial articles in a new artifact
executor.store_artifact('most_recent_controversial_articles', 'most recent controversial articles', controversial_articles)
```

Example: Adding a summary of the comments to the previously retrieved controversial articles
```
# Get the previously retrieved data from the artifact
articles = executor.get_artifact('most_recent_controversial_articles')

for article in articles:
    # Use the inline struct syntax when calling SQL functions.
    sql = f\"""
      SELECT
        text,
        author,
        timestamp
      FROM
        GetArticleComments(STRUCT(
            {article['ID']} as article_id
            50 as limit
            'recent' AS sort_by
        ))
    \"""
    comments = executor.run_sql(sql)
    comments_summary = executor.summarize('Given these comments on an article, summarize what they are saying', '\n'.join(comments))
    article['Comments Summary'] = comments_summary

# store the articles with summary in a new artifact
executor.store_artifact('most_recent_controversial_articles_with_comments_summary, 'Most recent controversial articles with summarized comments', articles)
```"""
    return examples


def build_system_prompt_fragment(tool_name: str, catalog: Catalog, artifacts: Artifacts, options: PythonOptions) -> str:
    prompt = f"""
When executing Python code using the "{tool_name}" tool, you have access to an `executor` variable, which has the following methods:
{build_python_methods(options)}

Some Python code examples:

{build_python_examples(options)}"""

    if options.enable_artifacts:
        prompt += """
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

        if len(artifacts.artifacts) > 0:
            prompt += f"""
The previously created artifacts by you are:

{artifacts.render_for_prompt()}
"""

    prompt += f"""
The schema of the database available using the "{tool_name}" tool is as follows.

{catalog.render_for_prompt()}
"""
    return prompt


@dataclass
class PythonToolOutput(ToolOutput):
    output: str
    error: Optional[str]
    sql_statements: list[SqlStatement]
    modified_artifact_identifiers: list[str]

    def get_response(self) -> str:
        response = self.output
        if self.error is not None:
            response += self.error
        return response

    def get_error(self) -> Optional[str]:
        return self.error


@dataclass
# Do not construct directly, use create_python_tool instead.
class PachaPythonTool(Tool):
    data_engine: DataEngine
    llm: Llm
    options: PythonOptions = field(default_factory=lambda: PythonOptions(
        enable_artifacts=True, enable_ai_primitives=True))
    hooks: PythonExecutorHooks = field(default_factory=PythonExecutorHooks)
    catalog: Catalog = field(init=False)

    def name(self) -> str:
        return 'execute_python'

    async def execute(self, input, context: ExecutionContext) -> PythonToolOutput:
        input_code = input.get(CODE_ARGUMENT_NAME)
        if input_code is None:
            return PythonToolOutput(output="", error=f"Missing parameter {CODE_ARGUMENT_NAME}", sql_statements=[], modified_artifact_identifiers=[])
        executor = PythonExecutor(
            data_engine=self.data_engine, context=context, hooks=self.hooks, llm=self.llm)
        await executor.exec_code(input_code)
        return PythonToolOutput(output=executor.output_text, error=executor.error, sql_statements=executor.sql_statements, modified_artifact_identifiers=executor.modified_artifact_identifiers)

    def input_schema(self):
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

    def description(self) -> str:
        return build_tool_description(self.options)

    def system_prompt_fragment(self, artifacts: Artifacts) -> str:
        return build_system_prompt_fragment(self.name(), self.catalog, artifacts, self.options)

    def input_as_text(self, input) -> str:
        return input.get(CODE_ARGUMENT_NAME, "")


async def create_python_tool(*args, **kwargs) -> PachaPythonTool:
    tool = PachaPythonTool(*args, **kwargs)
    tool.catalog = await tool.data_engine.get_catalog()
    return tool
