from dataclasses import dataclass, field
from typing import Any, Callable, Optional, cast, Union, TypedDict
from pacha.error import PachaException
from pacha.sdk.chat import ToolCall, ToolCallResponse, AssistantTurn
from pacha.sdk.tool import ToolOutput
from pacha.sdk.tools import PythonToolOutputJson, SqlToolOutputJson, PythonToolOutput, SqlToolOutput

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



ToolOutputJson = PythonToolOutputJson | SqlToolOutputJson


class ToolCallResponseJson(TypedDict):
    call_id: str
    output: ToolOutputJson

def to_tool_call_response_json(tool_call_response: ToolCallResponse) -> ToolCallResponseJson:
    output_dict = tool_call_response.output.get_output_as_dict()
    if isinstance(tool_call_response.output, PythonToolOutput):
        python_tool_output = cast(PythonToolOutputJson, output_dict)
        return ToolCallResponseJson(
            call_id=tool_call_response.call_id,
            # Note: We explicitly construct the output json again for type hints
            output=PythonToolOutputJson(
                output=python_tool_output["output"],
                error=python_tool_output["error"],
                sql_statements=python_tool_output["sql_statements"]
            )
        )
    elif isinstance(tool_call_response.output, SqlToolOutput):
        sql_tool_output = cast(SqlToolOutputJson, output_dict)
        return ToolCallResponseJson(
            call_id=tool_call_response.call_id,
            # Note: We explicitly construct the output json again for type hints
            output=SqlToolOutputJson(
                output=sql_tool_output["output"],
                error=sql_tool_output["error"]
            )
        )
    else:
        raise TypeError("Unsupported ToolOutput type")


class AssistantTurnJson(TypedDict):
    text: Optional[str]
    tool_calls: list[ToolCallJson]

def to_assistant_turn_json(assistant_turn: AssistantTurn) -> AssistantTurnJson:
    return AssistantTurnJson(
        text=assistant_turn.text,
        tool_calls=list(map(lambda tool_call: to_tool_call_json(tool_call), assistant_turn.tool_calls))
    )


class ToolResponseTurnJson(TypedDict):
    tool_responses: list[ToolCallResponseJson]

def to_tool_response_turn_json(tool_response_turn) -> ToolResponseTurnJson:
    return ToolResponseTurnJson(
        tool_responses=list(
            map(lambda tool_response: tool_response.to_json(), tool_response_turn.tool_responses))
    )
@dataclass
class ToolResponseTurn:
    tool_responses: list[ToolCallResponse]


