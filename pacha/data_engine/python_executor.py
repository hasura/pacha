from dataclasses import dataclass, field
import traceback
from typing import Callable, Optional
from pacha.data_engine.artifacts import ArtifactData, ArtifactType, Artifacts
from pacha.data_engine.data_engine import SqlHooks
from pacha.data_engine import DataEngine, SqlOutput, SqlStatement
from pacha.sdk.llm import Llm
import copy


def noop(*args, **kwargs):
    pass


@dataclass
class PythonExecutorHooks:
    on_python_execute: Callable[[str], None] = noop
    on_python_output: Callable[[str], None] = noop
    sql: SqlHooks = field(default_factory=SqlHooks)


@dataclass
class PythonExecutor:
    data_engine: DataEngine
    hooks: PythonExecutorHooks
    artifacts: Artifacts
    llm: Llm
    sql_statements: list[SqlStatement] = field(default_factory=list)
    output_text: str = ""
    error: Optional[str] = None
    modified_artifact_identifiers: list[str] = field(default_factory=list)

    def run_sql(self, sql: str) -> SqlOutput:
        self.hooks.sql.on_sql_request(sql)
        data = self.data_engine.execute_sql(sql)
        self.hooks.sql.on_sql_response(data)
        self.sql_statements.append(SqlStatement(sql, data))
        columns = f", columns: {list(data[0].keys())}" if len(data) > 0 else ""
        self.output(f'SQL statement returned {len(data)} rows{columns}')
        return data

    # The below 3 functions all do the same thing. They all exist because we're experimenting with what's the best name to use for an LLM.
    def output(self, text):
        self.output_text += str(text) + '\n'

    def observe(self, text):
        self.output(text)

    def print(self, text):
        self.output(text)

    def store_artifact(self, identifier: str, title: str, artifact_type: ArtifactType, data: ArtifactData):
        output = self.artifacts.store_artifact(identifier, title, artifact_type, data)
        self.modified_artifact_identifiers.append(identifier)
        self.output(output)

    def get_artifact(self, identifier: str) -> ArtifactData:
        return copy.deepcopy(self.artifacts.get_artifact(identifier))

    def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
        if allow_multiple:
            system_prompt = f"""
                You are a classifier that classifies the user input into zero or more of these categories: {categories}
                {instructions}
                Your response must contain the list of applicable categories, one per line. If no cateogies apply, then simply respond with "None".
                Your response should contain with no fluff words (eg: nothing like "here is the category") or fluff characters (eg: no extra punctuation)
            """
        else:
            system_prompt = f"""
                You are a classifier that classifies the user input into one of these categories: {categories}
                {instructions}
                Your response must exactly be one of the possible categories with no fluff words (eg: nothing like "here is the category") or fluff characters (eg: no extra punctuation)
            """
        
        output: list[str | list[str]] = []
        for input in inputs_to_classify:
            answer = self.llm.ask(input, system_prompt).strip()
            if allow_multiple:
                if answer == 'None':
                    output.append([])
                else:
                    output.append(answer.split('\n'))
            else:
                output.append(answer)
        return output
    
    def summarize(self, instructions: str, input: str) -> str:
        system_prompt = f"""
            You are a summarization tool. Given the input from the user, summarize it according to these instructions. Response only with the summarized text and nothing else (eg: no fluff words like "here is the summary", and no chatting to the user).
            {instructions}
        """
        return self.llm.ask(input, system_prompt)

    def exec_code(self, code: str):
        try:
            # TODO: This is not safe. Sandbox this.
            self.hooks.on_python_execute(code)
            exec(code, {"executor": self})
            self.hooks.on_python_output(self.output_text)
        except Exception as e:
            limit = 1 - len(traceback.extract_tb(e.__traceback__))
            self.error = traceback.format_exc(limit)
