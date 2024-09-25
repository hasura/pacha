from typing import Any

from pydantic import BaseModel

SqlOutput = list[dict[str, Any]]


class SqlStatement(BaseModel):
    sql: str
    result: SqlOutput
