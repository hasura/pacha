from dataclasses import dataclass
from typing import Optional

from promptql.artifacts import Artifact
from promptql.sql.catalog import Catalog


@dataclass
class PromptQlOptions:
    enable_artifacts: bool = True # Whether the PromptQL program is allowed to store and read artifacts."
    enable_artifact_rendering: bool = True # Whether the LLM should be instructed to not dump artifacts in context, but reference them in the response
    enable_classify: bool = True # Whether the PromptQL program should be allowed to use the classify AI primitive
    enable_summarize: bool = True # Whether the PromptQL program should be allowed to use the classify AI primitive


def build_python_methods(options: PromptQlOptions) -> str:
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
        if options.enable_artifact_rendering:
            methods += """
  Do not use this to print large amounts of data, use artifacts instead. If the user asks for insights or analysis on artifact data that requres you to view, then you should print that data."""
        methods += """
- `def store_artifact(self, identifier: str, title: str, artifact_type: 'table' | 'text', data)`:
  This can be used to store any retrieved / computed data in a tabular form, for referencing"""
        if options.enable_artifact_rendering:
            methods += "either when talking to the user or "
        methods += """when reading it in subsequent turns.
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

    if options.enable_classify:
        methods += """
- `def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]`:
  This can be used to call an AI language model to categorize the given `inputs_to_classify` into the specified `categories`.
  If `allow_multiple` is True, then zero or more categories can be chosen for each input and hence the output is a list of list of categories - one list per input.
  If `allow_multiple` is False, then exactly one category is chosen for each input and the output is a list of categories - one per input.
  Any instructions for classification (eg: what the categories mean) should be clearly given in `instructions`. All the data needed for classification should be a part of `data` - the classification model cannot access any external data."""

    if options.enable_summarize:
        methods += """
- `def summarize(self, instructions: str, input: str) -> str`:
  This can be used to call a language model to summarize the `input`. Any summarization instructions (eg: what information to preserve) must be given in `instructions`. The output is the summarized text.
"""
    return methods


def build_generic_promptql_examples(options: PromptQlOptions):
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

    if options.enable_classify and options.enable_artifacts:
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
```"""

    if options.enable_summarize and options.enable_artifacts:
        examples += """

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


def get_promptql_description(options: PromptQlOptions, post_example_instructions: Optional[str], promptql_examples: Optional[str], artifacts: list[Artifact], catalog: Catalog):
    if promptql_examples is None:
        promptql_examples = build_generic_promptql_examples(options)

    prompt = f"""
When executing Python code, you have access to an `executor` variable, which has the following methods:
{build_python_methods(options)}

Some Python code examples:

{build_generic_promptql_examples(options)}"""

    if post_example_instructions is not None:
        prompt += f"\n\n{post_example_instructions}\n"

    if options.enable_artifacts and len(artifacts) > 0:
        prompt += f"""
The previously created artifacts by you are:

{"\n\n".join([artifact.render_for_prompt() for artifact in artifacts])}"""

    prompt += f"""
The schema of the database available using the run_sql method is as follows.

{catalog.render_for_prompt()}
"""

    return prompt
