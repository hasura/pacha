from dataclasses import dataclass, field
from typing import Any, Callable, Optional, cast, Union, TypedDict
from pacha.data_engine.artifacts import ArtifactJson, Artifacts
from pacha.data_engine.data_engine import SqlOutput, SqlStatement, SqlStatementJson
from pacha.error import PachaException
from pacha.sdk.chat import ToolCall, UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse
from pacha.sdk.tool import ToolOutput
from pacha.sdk.tools import PythonToolOutput, SqlToolOutput

import copy
import json

# ToolCall and ToolCallResponse are here instead of pacha/sdk/tools/tool.py intentionally.
# Tool calls are less about the tool and more about the chat itself
# (i.e. tool calls with IDs always happen in the context of a chat)


class ToolCallJson(TypedDict):
    name: str
    call_id: str
    input: dict


def to_tool_call_json(tool_call: ToolCall) -> ToolCallJson:
    return ToolCallJson(
        name=tool_call.name,
        call_id=tool_call.call_id,
        input=tool_call.input
    )


class PythonToolOutputJson(TypedDict):
    output: str
    error: Optional[str]
    sql_statements: list[SqlStatementJson]
    modified_artifacts: list[ArtifactJson]


def python_tool_output_to_json(output: PythonToolOutput, artifacts: Artifacts) -> PythonToolOutputJson:
    return {
        "output": output.output,
        "error": output.error,
        "sql_statements": [statement.to_json() for statement in output.sql_statements],
        "modified_artifacts": [artifacts.artifacts[identifier].to_json() for identifier in output.modified_artifact_identifiers]
    }


class SqlToolOutputJson(TypedDict):
    output: Optional[SqlOutput]
    error: Optional[str]


def sql_tool_output_to_json(output: SqlToolOutput) -> SqlToolOutputJson:
    return {
        "output": output.output,
        "error": output.error
    }


ToolOutputJson = PythonToolOutputJson | SqlToolOutputJson


class ToolCallResponseJson(TypedDict):
    call_id: str
    output: ToolOutputJson


def to_tool_call_response_json(tool_call_response: ToolCallResponse, artifacts: Artifacts) -> ToolCallResponseJson:
    if isinstance(tool_call_response.output, PythonToolOutput):
        python_tool_output = python_tool_output_to_json(
            tool_call_response.output, artifacts)
        return ToolCallResponseJson(
            call_id=tool_call_response.call_id,
            output=python_tool_output
        )
    elif isinstance(tool_call_response.output, SqlToolOutput):
        sql_tool_output = sql_tool_output_to_json(tool_call_response.output)
        return ToolCallResponseJson(
            call_id=tool_call_response.call_id,
            # Note: We explicitly construct the output json again for type hints
            output=sql_tool_output
        )
    else:
        raise TypeError("Unsupported ToolOutput type")


class AssistantTurnJson(TypedDict):
    text: Optional[str]
    tool_calls: list[ToolCallJson]


def to_assistant_turn_json(assistant_turn: AssistantTurn) -> AssistantTurnJson:
    return AssistantTurnJson(
        text=assistant_turn.text,
        tool_calls=list(map(lambda tool_call: to_tool_call_json(
            tool_call), assistant_turn.tool_calls))
    )


class ToolResponseTurnJson(TypedDict):
    tool_responses: list[ToolCallResponseJson]


def to_tool_response_turn_json(tool_response_turn: ToolResponseTurn, artifacts: Artifacts) -> ToolResponseTurnJson:
    return ToolResponseTurnJson(
        tool_responses=[to_tool_call_response_json(
            response, artifacts) for response in tool_response_turn.tool_responses]
    )
