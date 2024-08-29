from typing import  Optional, TypedDict, NotRequired, Literal
from pacha.data_engine.artifacts import ArtifactJson, Artifacts, Artifact
from pacha.data_engine.data_engine import SqlOutput, SqlStatement, SqlStatementJson
from pacha.sdk.chat import ToolCall, Turn, UserTurn, AssistantTurn, ToolResponseTurn, ToolCallResponse
from pacha.sdk.tools import PythonToolOutput, SqlToolOutput

import json


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
            output=sql_tool_output
        )
    else:
        raise TypeError("Unsupported ToolOutput type")


class UserTurnJson(TypedDict):
    text: str
    type: NotRequired[Literal["user"]]


UserTurnJson.__annotations__['type'] = Literal["user"]


def to_user_turn_json(user_turn: UserTurn) -> UserTurnJson:
    return UserTurnJson(
        text=user_turn.text,
        type="user"
    )


def from_user_turn_json(user_turn_json: UserTurnJson) -> UserTurn:
    return UserTurn(
        text=user_turn_json['text']
    )


class AssistantTurnJson(TypedDict):
    text: Optional[str]
    tool_calls: list[ToolCallJson]
    type: NotRequired[Literal["assistant"]]


AssistantTurnJson.__annotations__['type'] = Literal["assistant"]


def to_assistant_turn_json(assistant_turn: AssistantTurn) -> AssistantTurnJson:
    return AssistantTurnJson(
        text=assistant_turn.text,
        tool_calls=list(map(lambda tool_call: to_tool_call_json(
            tool_call), assistant_turn.tool_calls)),
        type="assistant"
    )


def from_assistant_turn_json(assistant_turn_json: AssistantTurnJson) -> AssistantTurn:
    # Convert tool_calls from JSON to ToolCall objects
    tool_calls = [ToolCall(name=tc['name'], call_id=tc['call_id'], input=tc['input'])
                  for tc in assistant_turn_json['tool_calls']]

    # Create and return an AssistantTurn object
    return AssistantTurn(
        text=assistant_turn_json['text'],
        tool_calls=tool_calls
    )


class ToolResponseTurnJson(TypedDict):
    tool_responses: list[ToolCallResponseJson]
    type: NotRequired[Literal["tool_response"]]


ToolResponseTurnJson.__annotations__['type'] = Literal["tool_response"]


def to_tool_response_turn_json(tool_response_turn: ToolResponseTurn, artifacts: Artifacts) -> ToolResponseTurnJson:
    return ToolResponseTurnJson(
        tool_responses=[to_tool_call_response_json(
            response, artifacts) for response in tool_response_turn.tool_responses],
        type="tool_response"
    )


def from_tool_response_turn_json(tool_response_turn_json: ToolResponseTurnJson) -> ToolResponseTurn:
    tool_responses = []
    for response_json in tool_response_turn_json['tool_responses']:
        call_id = response_json['call_id']
        output_json = response_json['output']

        if 'sql_statements' in output_json:  # It's a PythonToolOutput
            output = PythonToolOutput(
                output=output_json['output'],
                error=output_json['error'],
                sql_statements=[SqlStatement.from_json(
                    stmt) for stmt in output_json['sql_statements']],
                modified_artifact_identifiers=[
                    artifact['identifier'] for artifact in output_json['modified_artifacts']]
            )
        else:  # It's a SqlToolOutput
            output = SqlToolOutput(
                output=output_json['output'],
                error=output_json['error']
            )

        tool_responses.append(ToolCallResponse(call_id=call_id, output=output))

    return ToolResponseTurn(tool_responses=tool_responses)


TurnJson = UserTurnJson | AssistantTurnJson | ToolResponseTurnJson


def from_turn_json(turn_json: str) -> Turn:
    try:
        turn_dict = json.loads(turn_json)

        if turn_dict.get('type') == 'user':
            return from_user_turn_json(turn_dict)
        elif turn_dict.get('type') == 'assistant':
            return from_assistant_turn_json(turn_dict)
        elif turn_dict.get('type') == 'tool_response':
            return from_tool_response_turn_json(turn_dict)
        else:
            raise ValueError("JSON doesn't match any expected turn type")
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"Invalid JSON string: {e}", e.doc, e.pos)


def to_turn_json(turn: Turn, artifacts: Artifacts) -> TurnJson:
    if isinstance(turn, UserTurn):
        return to_user_turn_json(turn)
    elif isinstance(turn, AssistantTurn):
        return to_assistant_turn_json(turn)
    elif isinstance(turn, ToolResponseTurn):
        return to_tool_response_turn_json(turn, artifacts)


def from_artifact_json(artifact_json: str) -> Artifact:
    artifact_dict = json.loads(artifact_json)
    return Artifact(
        identifier=artifact_dict['identifier'],
        title=artifact_dict['title'],
        artifact_type=artifact_dict['artifact_type'],
        data=artifact_dict['data']
    )
