from dataclasses import dataclass, field
from typing import Any, Optional
from pacha.data_engine.data_engine import SqlStatement


@dataclass
class QueryPlan:
    raw: str
    python_code: Optional[str] = None


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
