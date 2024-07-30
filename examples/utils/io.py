from enum import Enum
from typing import Optional

from pacha.data_engine.data_engine import SqlHooks
from pacha.query_planner.query_planner import QueryPlannerHooks, QueryPlan, DataContext
from pacha.data_engine import SqlOutput
from pacha.query_planner.python_executor import PythonExecutorHooks

ENDC = '\033[0m'


class Colors(Enum):
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


USER_INPUT_COLOR = Colors.CYAN
QUERY_PLAN_COLOR = Colors.BLUE
ASSISTANT_RESPONSE_COLOR = Colors.GREEN
DATA_ENGINE_COLOR = Colors.MAGENTA


def output(prompt: str, color: Colors, text: Optional[str] = None):
    post_prompt = ENDC if text is None else f":{ENDC} {text}"
    print(f"\n{color.value}{prompt}{post_prompt}\n")


def multi_line_input(prompt: str, color: Colors) -> str:
    print(f"{color.value}{prompt}:{ENDC} ", end='')
    lines = []
    while True:
        try:
            line = input()
            if line:
                lines.append(line)
            else:
                break
        except EOFError:
            break
    return '\n'.join(lines)


MAX_SQL_OUTPUT_LENGTH = 2000


def output_query_plan(query_plan: QueryPlan):
    output("Query Plan", QUERY_PLAN_COLOR, query_plan.raw)


def output_sql_request(sql: str):
    output("SQL Query", DATA_ENGINE_COLOR, sql)


def output_sql_response(data: SqlOutput):
    output("SQL Response", DATA_ENGINE_COLOR,
           str(data)[:MAX_SQL_OUTPUT_LENGTH])


def output_python_code(code: str):
    output("Python Code", QUERY_PLAN_COLOR, '\n' + code)


def output_query_plan_execution_result(data_context: DataContext):
    if data_context.data is None:
        execution_output = "None"
    else:
        execution_output = "\n" + data_context.data.output
        if data_context.data.error is not None:
            execution_output += "\n" + data_context.data.error

        output("Query Plan Execution Result",
               QUERY_PLAN_COLOR, execution_output)


def get_query_planner_hooks_for_rendering_to_stdout() -> QueryPlannerHooks:
    return QueryPlannerHooks(
        on_query_plan_generation=output_query_plan,
        on_query_plan_execution=output_query_plan_execution_result,

        python=get_python_executor_hooks_for_rendering_to_stdout())


def get_python_executor_hooks_for_rendering_to_stdout() -> PythonExecutorHooks:
    return PythonExecutorHooks(sql=get_sql_hooks_for_rendering_to_stdout(),
                               on_python_execute=output_python_code)


def get_sql_hooks_for_rendering_to_stdout() -> SqlHooks:
    return SqlHooks(on_sql_request=output_sql_request,
                    on_sql_response=output_sql_response)
