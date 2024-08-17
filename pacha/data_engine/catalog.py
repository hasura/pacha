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
class Argument:
    name: str
    type: str
    position: int
    description: Optional[str] = None
    
    
@dataclass
class Function:
    name: str
    description: Optional[str] = None
    fields: dict[str, Column] = field(default_factory=dict)
    arguments: dict[str, Argument] = field(default_factory=dict)


@dataclass
class Schema:
    name: str
    tables: dict[str, Table] = field(default_factory=dict)
    functions: dict[str, Function] = field(default_factory=dict)


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
            
            for func in schema.functions.values():
                rendered += generate_signature(func)
                rendered += "\n"

    return rendered


# TODO: merge this with map_data_type function
def get_type_name(type_str: str) -> str:
    type_mapping = {
        "STRING": "string",
        "FLOAT32": "float",
        "BOOL": "boolean",
        "ARRAY<STRING>": "string[]",
    }
    if type_str.startswith("STRUCT<"):
        return "struct"
    return type_mapping.get(type_str, type_str.lower())



def generate_signature(func: Function) -> str:

    func_name = func.name

    # Get arguments
    func_args = [arg for arg in func.arguments.values()]
    arg_lines = []
    for arg in sorted(func_args, key=lambda x: x.position):
        arg_type = get_type_name(arg.type)
        arg_desc = arg.description if arg.description else ""
        arg_lines.append(f"    {arg.name} {arg_type} -- {arg_desc}")
    arg_str = ",\n".join(arg_lines)

    # Get return fields
    return_str = "table(\n    " + ",\n    ".join([f"{field.name} {get_type_name(field.type)}" 
                                                  for field in func.fields.values()]) + "\n)"

    signature = f"CREATE FUNCTION {func_name}(\n{arg_str}\n) RETURNS {
        return_str}"

    return signature


