from dataclasses import dataclass, field
from typing import Callable, Optional
from pacha.data_engine.artifacts import Artifacts
from pacha.data_engine.context import ExecutionContext
from pacha.query_planner.instructions import *
from pacha.data_engine import DataEngine, SqlOutput
from pacha.query_planner.input import QueryPlanningInput
from pacha.query_planner.data_context import *
from pacha.data_engine.python_executor import PythonExecutor, PythonExecutorHooks
from pacha.utils.logging import get_logger
from pacha.sdk.chat import Turn, AssistantTurn, UserTurn
import pacha.sdk.llm as llm
import pacha.sdk.llms.llama as llama
import pacha.sdk.llms.openai as openai


CODE_BEGIN_BACKTICKS = "```\n"
CODE_BEGIN_BACKTICKS_PYTHON = "```python\n"
CODE_END = "```"

# 8k tokens * ~4 characters per token
TOTAL_PROMPT_LIMIT = 32000

MAX_RETRIES = 3
MAX_CONVERSATION_HISTORY_TURNS = 3


def get_system_instructions(llm: llm.Llm, catalog: Catalog):
    if isinstance(llm, openai.OpenAI):
        return OPENAI_SYSTEM_INSTRUCTIONS_TEMPLATE.format(catalog=catalog.render_for_prompt())
    else:
        return LLAMA_SYSTEM_INSTRUCTIONS_TEMPLATE.format(catalog=catalog.render_for_prompt())


@dataclass
class QueryPlannerException(Exception):
    def __init__(self, message):
        super().__init__(message)


def get_previous_turns(data_context: Optional[DataContext]) -> list[Turn]:
    if data_context is None or data_context.data is None or data_context.data.error is None:
        return []
    turns = get_previous_turns(data_context.previous_try)
    turns.append(AssistantTurn(text=data_context.query_plan.raw))
    turns.append(UserTurn(text=
                 f'Your script generated the following error. Fix it.\n {data_context.data.error}'))

    return turns


def noop(*args, **kwargs):
    pass


@dataclass
class QueryPlannerHooks:
    on_query_plan_generation: Callable[[QueryPlan], None] = noop
    on_query_plan_execution: Callable[[DataContext], None] = noop
    python: PythonExecutorHooks = field(default_factory=PythonExecutorHooks)


@dataclass
class QueryPlanner:
    data_engine: DataEngine
    system_prompt: Optional[str] = None
    planner_llm: llm.Llm = field(default_factory=llama.LlamaOnTogether)
    hooks: QueryPlannerHooks = field(default_factory=QueryPlannerHooks)
    catalog: Catalog = field(init=False)

    async def __post_init__(self):
        self.catalog = await self.data_engine.get_catalog()

    async def exec_code(self, code: str) -> QueryPlanExecutionResult:
        executor = PythonExecutor(self.data_engine, context=ExecutionContext(), hooks=self.hooks.python, llm=self.planner_llm)
        await executor.exec_code(code)
        return QueryPlanExecutionResult(executor.output_text, executor.sql_statements, executor.error)

    async def get_model_output(self, input: QueryPlanningInput, previous_try: Optional[DataContext]) -> str:
        query_planner_system_prompt = get_system_instructions(
            self.planner_llm, self.catalog)
        if self.system_prompt is not None:
            query_planner_system_prompt += f"\nAdditional Instructions: {
                self.system_prompt}"

        turns = get_previous_turns(previous_try)

        previous_turns_length = 0
        for turn in turns:
            if isinstance(turn, UserTurn):
                previous_turns_length += len(turn.text)
            elif isinstance(turn, AssistantTurn) and turn.text is not None:
                previous_turns_length += len(turn.text)

        user_prompt_limit = TOTAL_PROMPT_LIMIT - \
            len(query_planner_system_prompt) - \
            previous_turns_length

        user_prompt = input.as_user_prompt(
            user_prompt_limit, MAX_CONVERSATION_HISTORY_TURNS)

        turns = [
            UserTurn(text=user_prompt)
        ] + turns

        output = (await self.planner_llm.get_assistant_turn(
            llm.Chat(system_prompt=query_planner_system_prompt, turns=turns),
            temperature=0)).text
        assert(output is not None)
        return output

    async def get_query_plan(self, input: QueryPlanningInput, previous_try: Optional[DataContext]) -> QueryPlan:
        model_output = await self.get_model_output(input, previous_try)

        python_code = None

        execute_begin = model_output.find(CODE_BEGIN_BACKTICKS_PYTHON)
        code_begin_length = len(CODE_BEGIN_BACKTICKS_PYTHON)
        if execute_begin < 0:
            execute_begin = model_output.find(CODE_BEGIN_BACKTICKS)
            code_begin_length = len(CODE_BEGIN_BACKTICKS)
        if execute_begin >= 0:
            execute_end = model_output.find(
                CODE_END, execute_begin + code_begin_length)
            if execute_end >= 0:
                python_code = model_output[(
                    execute_begin + code_begin_length):execute_end]

        get_logger().debug(f"Python Code:\n {python_code}")

        return QueryPlan(raw=model_output, python_code=python_code)

    async def execute_query_plan(self, query_plan: QueryPlan) -> Optional[QueryPlanExecutionResult]:
        if query_plan.python_code is None:
            return None
        return await self.exec_code(query_plan.python_code)

    async def get_data_context(self, input: QueryPlanningInput) -> DataContext:
        get_logger().info("Calling Query Planner...")
        data_context = await self.get_data_context_internal(input, previous_try=None)
        retries = 0
        while data_context.data is not None and data_context.data.error is not None and retries < MAX_RETRIES:
            get_logger().info("Retrying Query Planning...")
            data_context = await self.get_data_context_internal(
                input, previous_try=data_context)
            retries += 1
        return data_context

    async def get_data_context_internal(self, input: QueryPlanningInput, previous_try: Optional[DataContext]) -> DataContext:
        query_plan = await self.get_query_plan(input, previous_try)
        self.hooks.on_query_plan_generation(query_plan)

        execution_result = await self.execute_query_plan(query_plan)
        data_context = DataContext(
            query_plan, data=execution_result, previous_try=previous_try)
        self.hooks.on_query_plan_execution(data_context)
        return data_context
