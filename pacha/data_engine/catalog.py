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
class Array:
    element_type: 'TypeReference'


@dataclass
class TypeReference:
    nullable: bool
    underlying_type: Array | ScalarType | str

    def render(self, with_not_null: bool) -> str:
        rendered = ""
        if isinstance(self.underlying_type, Array):
            rendered += f"ARRAY<{
                self.underlying_type.element_type.render(with_not_null)}>"
        elif isinstance(self.underlying_type, ScalarType):
            rendered += self.underlying_type.name
        else:
            rendered += self.underlying_type
        if with_not_null and not self.nullable:
            rendered += " NOT NULL"
        return rendered


@dataclass
class StructField:
    name: str
    type: TypeReference
    description: Optional[str] = None

    def render(self, with_not_null: bool) -> str:
        rendered = f"{self.name} {self.type.render(with_not_null)}"
        if self.description is not None:
            rendered += " -- Description: " + self.description
        return rendered


class StructType:
    name: str
    fields: dict[str, StructField] = field(default_factory=dict)
    description: Optional[str] = None

    def render(self) -> str:
        rendered = f"CREATE STRUCT {self.name} <"
        if self.description is not None:
            rendered += " -- Description: " + self.description
        rendered += "\n"
        for field in self.fields.values():
            rendered += "  " + field.render(with_not_null=False) + "\n"
        rendered += ">"
        return rendered


@dataclass
class Column:
    name: str
    type: TypeReference
    description: Optional[str] = None

    def render(self) -> str:
        rendered = f"{self.name} {self.type.render(with_not_null=False)}"
        if self.description is not None:
            rendered += " -- Description: " + self.description
        return rendered


@dataclass
class Table:
    name: str
    description: Optional[str] = None
    columns: dict[str, Column] = field(default_factory=dict)
    foreign_keys: list['ForeignKey'] = field(default_factory=list)

    def render(self, schema_name: str) -> str:
        rendered = f"CREATE TABLE {schema_name}.{self.name} ("
        if self.description is not None:
            rendered += " -- Description: " + self.description
        rendered += "\n"
        for field in self.columns.values():
            rendered += f"  {field.render()}\n"
        for foreign_key in self.foreign_keys:
            rendered += f"  {foreign_key.render()}\n"
        rendered += ")"
        return rendered


@dataclass
class Argument:
    name: str
    type: TypeReference
    description: Optional[str] = None

    def render(self) -> str:
        rendered = f"{self.name} {self.type.render(with_not_null=True)}"
        if self.description is not None:
            rendered += " -- Description: " + self.description
        return rendered


@dataclass
class Function:
    name: str
    arguments: dict[str, Argument]
    # Currently we only have table valued functions
    result_type: dict[str, Column]
    description: Optional[str] = None

    def render(self) -> str:
        rendered = f"CREATE FUNCTION {self.name} ("
        if self.description is not None:
            rendered += " -- Description: " + self.description
        rendered += "\nSTRUCT <\n"
        for argument in self.arguments.values():
            rendered += f"  {argument.render()}\n"
        rendered += ">) RETURNS TABLE ("
        for column in self.result_type.values():
            rendered += f"  {column.render()}\n"
        rendered += ")"
        return rendered


@dataclass
class ForeignKeyMapping:
    source_column: str
    target_column: str


@dataclass
class ForeignKey:
    target_schema: str
    target_table: str
    mapping: list[ForeignKeyMapping] = field(default_factory=list)

    def render(self) -> str:
        rendered = 'FOREIGN KEY ('
        rendered += ', '.join(
            mapping.source_column for mapping in self.mapping)
        rendered += f') REFERENCES {self.target_schema}.{
            self.target_table}('
        rendered += ', '.join(
            mapping.target_column for mapping in self.mapping)
        rendered += ')'
        return rendered


@dataclass
class Schema:
    name: str
    tables: dict[str, Table] = field(default_factory=dict)

    def render(self) -> str:
        rendered = ""
        for table in self.tables.values():
            rendered += "\n"
            rendered += table.render(self.name)
            rendered += "\n"
        return rendered


@dataclass
class Catalog:
    schemas: dict[str, Schema] = field(default_factory=dict)
    functions: dict[str, Function] = field(default_factory=dict)

    def render_for_prompt(self) -> str:
        rendered = ""
        for schema in self.schemas.values():
            rendered += schema.render()
        for function in self.functions.values():
            rendered += "\n"
            rendered += function.render()
            rendered += "\n"
        return rendered
