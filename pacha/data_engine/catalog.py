from enum import Enum
from typing import Optional
from dataclasses import dataclass, field


class ScalarType(Enum):
    UNKNOWN = 0
    INTEGER = 1
    NUMERIC = 2
    TEXT = 3
    BOOLEAN = 4
    TIMESTAMP = 5
    DATE = 6
    VECTOR = 7


@dataclass
class Column:
    name: str
    type: ScalarType
    description: Optional[str] = None


@dataclass
class Table:
    name: str
    description: Optional[str] = None
    columns: dict[str, Column] = field(default_factory=dict)


@dataclass
class Schema:
    name: str
    tables: dict[str, Table] = field(default_factory=dict)


@dataclass
class Catalog:
    schemas: dict[str, Schema] = field(default_factory=dict)
    semantic_search_enabled: bool = False

    def render_for_prompt(self) -> str:
        return render_catalog(self)


SEMANTIC_SEARCH_PROMPT_FRAGMENT = """
In addition to the database schema below, you also have access to two special SQL function like this:

CREATE FUNCTION RELEVANCE(embedding VECTOR, query TEXT) RETURNS NUMERIC
Use this RELEVANCE function to retrieve data based on semantic similarity. The input query can be any text, including long or multiple sentences.

CREATE FUNCTION SIMILARITY(embedding1 VECTOR, embedding2 VECTOR) RETURNS NUMERIC
Use this function to compute the similarity between two vectors from the database.

When using the RELEVANCE and SIMILARITY functions, always ORDER BY relevance/similarity DESC. Never use RELEVANCE or SIMILARITY in WHERE.

If passing a literal of type VECTOR enclose it in single quotes. Eg: '[0.14, 0.1, 0.77, ...]'
"""

# Renders the catalog for an LLM prompt
def render_catalog(catalog: Catalog) -> str:
    rendered = ''
    for schema in catalog.schemas.values():
        for table in schema.tables.values():
            rendered += f'CREATE TABLE "{schema.name}"."{table.name}" ('
            if table.description is not None:
                rendered += f'-- Description: {table.description}'
            rendered += '\n'
            for field in table.columns.values():
                rendered += f'"{field.name}" {field.type.name},'
                if field.description is not None:
                    rendered += f'-- Description: {field.description}'
                rendered += '\n'
            rendered += ")\n"

    if catalog.semantic_search_enabled:
        rendered += SEMANTIC_SEARCH_PROMPT_FRAGMENT

    return rendered
