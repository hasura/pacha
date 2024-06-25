from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class QueryPlan:
    raw: str
    python_code: Optional[str] = None


@dataclass
class SqlStatement:
    sql: str
    result: list[dict[str, Any]]


@dataclass
class QueryPlanExecutionResult:
    output: str
    sql_statements: list[SqlStatement] = field(default_factory=list)
    error: Optional[str] = None


@dataclass
class DataContext:
    query_plan: QueryPlan
    data: Optional[QueryPlanExecutionResult] = None
    previous_try: Optional['DataContext'] = None
