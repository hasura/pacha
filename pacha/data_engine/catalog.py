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
    type: ScalarType | str
    description: Optional[str] = None


@dataclass
class Table:
    name: str
    description: Optional[str] = None
    columns: dict[str, Column] = field(default_factory=dict)
    foreign_keys: list['ForeignKey'] = field(default_factory=list)


@dataclass
class ForeignKeyMapping:
    source_column: str
    target_column: str


@dataclass
class ForeignKey:
    target_schema: str
    target_table: str
    mapping: list[ForeignKeyMapping] = field(default_factory=list)


@dataclass
class Schema:
    name: str
    tables: dict[str, Table] = field(default_factory=dict)


@dataclass
class Catalog:
    schemas: dict[str, Schema] = field(default_factory=dict)

    def render_for_prompt(self) -> str:
        return render_catalog(self)


def render_catalog(catalog: Catalog) -> str:
    """Renders the catalog for an LLM prompt"""
    rendered = ''
    for schema in catalog.schemas.values():
        for table in schema.tables.values():
            rendered += f'CREATE TABLE "{schema.name}"."{table.name}" ('
            if table.description is not None:
                rendered += f'-- Description: {table.description}'
            rendered += '\n'
            for field in table.columns.values():
                field_type = field.type.name if isinstance(
                    field.type, ScalarType) else field.type
                rendered += f'"{field.name}" {field_type},'
                if field.description is not None:
                    rendered += f'-- Description: {field.description}'
                rendered += '\n'
            for foreign_key in table.foreign_keys:
                rendered += 'FOREIGN KEY ('
                rendered += ', '.join(
                    mapping.source_column for mapping in foreign_key.mapping)
                rendered += f') REFERENCES {foreign_key.target_schema}.{
                    foreign_key.target_table}('
                rendered += ', '.join(
                    mapping.target_column for mapping in foreign_key.mapping)
                rendered += ')\n'
            rendered += ")\n"

    return rendered
