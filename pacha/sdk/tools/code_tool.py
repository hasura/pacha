from dataclasses import dataclass, field, asdict
from typing import Optional, TypedDict, NotRequired, cast
from pacha.data_engine.artifacts import Artifacts
from pacha.data_engine.catalog import Catalog
from pacha.data_engine.data_engine import DataEngine, SqlStatement
from pacha.data_engine.python_executor import PythonExecutor, PythonExecutorHooks
from pacha.sdk.tools.sql_tool import SYSTEM_PROMPT_FRAGMENT_TEMPLATE
from pacha.sdk.tools.tool import Tool, ToolOutput

CODE_ARGUMENT_NAME = "python_code"

TOOL_DESCRIPTION = """
This tool can be used to write Python scripts to retrieve data from the user's database, process data, or manipulate artifacts.

You have access to an `executor` variable, which has the following methods:
- `def get_from_database(self, sql: str) -> list[dict[str, Any]]`:
  This can be used to retrieve data by issuing an Apache DataFusion style SQL query. It returns a list of rows, with each row represented as a dictionary of selected column names (or aliases) to column values.
  Account for the possibilty of rows not meeting your filters in your python code or nullable columns returning None.
  Keep the SQL simple, doing more in Python if you need to, especially if SQL is throwing errors.
  Use COUNT(1) instead of COUNT(*), as the SQL engine doesn't support *.
  The python representations of various SQL types are:
  - any number-like types: int
  - any text-like types: str
  - DATE type: str (eg: '2024-08-14')
  - TIMESTAMP type: str (eg: '2024-08-14T13:58:26')
- `def observe(self, text: str)`:
  This can be used to output and observe anything from the Python script. This output will be visible to you. Do not use this to observe very large amounts of data.
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
  For follow-up questions, avoid retrieving the data from the database again if you can look it up in a previously created artifact.
"""

CODE_ARGUMENT_DESCRIPTION = """
The python code to execute. This must be Python code and not direct SQL. Examples:

```
data = executor.get_from_database("SELECT title FROM library.articles WHERE id = 5")
if len(data) == 0:
  executor.observe('not found')
else:
  executor.observe(f'{data[0]["title"]}')
```

```
data = executor.get_from_database("SELECT MIN(date) AS min_date FROM library.articles WHERE date >= '2023-01-1')
min_date = data[0][min_date]
executor.observe(f'{min_date'})
```

```
sql = \"""
    SELECT
        articles.id AS article_id,
        articles.title AS article_title,
        articles.published_at AS article_published_at,
        authors.first_name AS author_first_name
        authors.last_name AS author_last_name
    FROM
       library.articles AS articles
       JOIN library.authors AS authors ON articles.author_id = authors.id
    ORDER BY articles.published_at DESC
    LIMIT 100
\"""
data = executor.get_from_database(sql)
if len(data) == 0:
  executor.observe('no articles found')
else:
  artifact_data = []
  for row in data:
    artifact_row = {
      'ID': row['article_id'],
      'Title': row['article_title'],
      'Published at': row['article_date'],
      'Author': row['author_first_name'] + ' ' + row['author_last_name']
    }
    artifact_data.append(artifact_row)
  # Store the articles as a tabular artifact
  executor.store_artifact('most_recent_articles', '100 most recent articles', 'table', artifact_data)
```

```
most_recent_articles = executor.get_artifact('most_recent_articles')
most_recent_article = most_recent_articles[0]
first_article_id = most_recent_article[0]['ID']
article = executor.get_from_database(f"SELECT content FROM library.articles WHERE id = {first_article_id}")
if len(article) == 0:
  executor.observe(f"article with id {first_article_id} not found")
else:
  # Store the article content as a text artifact
  executor.store_artifact(f"article_{first_article_id}_content", f"Article: {most_recent_article['Title']}", 'text', article[0]['content'])
```
"""

SYSTEM_PROMPT_FRAGMENT_TEMPLATE = """
Any data or synthesized response that might be useful to reference later - either when talking to the user or for follow-up processing should be stored as an artifact.
When referenced in the response, artifacts are rendered with a special user-friendly UI.

When responding to the user with data which lives in an artifact, you can reference the artifact using an <artifact /> tag, with `identifier` being an attribute.
Eg: If you created an artifact called 'most_recent_articles' and wanted to respond to the user with that data. You would respond like this:

Here are the 100 most recent articles I retrieved:
<artifact identifier = 'most_recent_articles' />

This tag will be replaced by the actual artifact data when showed to the user. So do not repeat or summarize the data from in your response.
Remember you yourself can't see the entire artifact - only a preview of it, so any aggregate analysis on the artifact should be done in Python by reading the artifact and computing any required metrics.

For follow up questions, read or process the data from the artifact itself, instead of querying it again from the database. This is important because the user is viewing the artifact and so will refer to data in the artifact as it is.

Do not write very big python programs that do a lot of work. Instead, break them down into smaller programs (storing intermediate results in artifacts if needed), executing them, observing the output to see if it doing what you expect, and keeping the user informed on the progress.

The previously created artifacts by you are:

{artifacts}

The schema of the database available using the "{tool_name}" tool is as follows.

{catalog}
"""

class PythonToolOutputJson(TypedDict):
    output: str
    error: Optional[str]
    sql_statements: list[SqlStatement]


@dataclass
class PythonToolOutput(ToolOutput):
    output: str
    error: Optional[str]
    sql_statements: list[SqlStatement]

    def get_response(self) -> str:
        response = self.output
        if self.error is not None:
            response += self.error
        return response

    def get_error(self) -> Optional[str]:
        return self.error

    def get_output_as_dict(self) -> PythonToolOutputJson:
        return cast(PythonToolOutputJson, asdict(self))


@dataclass
class PachaPythonTool(Tool):
    data_engine: DataEngine
    hooks: PythonExecutorHooks = field(default_factory=PythonExecutorHooks)
    catalog: Catalog = field(init=False)

    def __post_init__(self):
        self.catalog = self.data_engine.get_catalog()

    def name(self) -> str:
        return 'execute_python'

    def execute(self, input, artifacts: Artifacts) -> PythonToolOutput:
        input_code = input.get(CODE_ARGUMENT_NAME)
        if input_code is None:
            return PythonToolOutput(output="", error=f"Missing parameter {CODE_ARGUMENT_NAME}", sql_statements=[])
        executor = PythonExecutor(
            data_engine=self.data_engine, artifacts=artifacts, hooks=self.hooks)
        executor.exec_code(input_code)
        return PythonToolOutput(output=executor.output_text, error=executor.error, sql_statements=executor.sql_statements)

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
        return TOOL_DESCRIPTION

    def system_prompt_fragment(self, artifacts: Artifacts) -> str:
        return SYSTEM_PROMPT_FRAGMENT_TEMPLATE.format(tool_name=self.name(), catalog=self.catalog.render_for_prompt(), artifacts=artifacts.render_for_prompt())

    def input_as_text(self, input) -> str:
        return input.get(CODE_ARGUMENT_NAME, "")
