import argparse
import asyncio
from dataclasses import dataclass
import re
from typing import Optional, override

from tabulate import tabulate

from promptql_playground import protocol
from promptql_playground.run import run_thread
from promptql_playground.thread import Thread, new_thread
from promptql.artifacts import Artifact, TableArtifact

from .utils.cli_args import add_promptql_config_args, build_promptql_config
from .utils.io import Colors, single_line_input, output


USER_INPUT_COLOR = Colors.CYAN
ASSISTANT_RESPONSE_COLOR = Colors.GREEN
CODE_COLOR = Colors.BLUE
MUTATION_COLOR = Colors.MAGENTA
ERROR_COLOR = Colors.RED
INFO_COLOR = Colors.YELLOW


def render_artifact(artifact: Artifact) -> str:
    if isinstance(artifact, TableArtifact):
        return tabulate(artifact.data, headers="keys", tablefmt="grid")
    else:
        return str(artifact.data)


def replace_artifact_tags(response: str, artifacts: list[Artifact]) -> str:
    def artifact_replacer(match):
        identifier = match.group('identifier')
        # Fetch artifact content from the dictionary
        referenced_artifact = None
        for artifact in artifacts:
            if artifact.identifier == identifier:
                referenced_artifact = artifact
        if referenced_artifact is None:
            return match.group(0)
        else:
            return render_artifact(referenced_artifact)

    # Regex pattern to detect <artifact /> tag and extract identifier
    pattern = r"<artifact\s+identifier='(?P<identifier>\w+)'[^>]*\/>"

    # Replace all artifact tags with corresponding content from the dictionary
    return re.sub(pattern, artifact_replacer, response)


@dataclass
class CliPromptQlWebsocket(protocol.WebSocket):
    user_input: str
    thread: Thread
    inited: bool = False
    sent_user_message: bool = False
    user_confirmation_request: Optional[protocol.UserConfirmationRequest] = None

    @override
    async def send(self, message: protocol.ServerMessage):
        if isinstance(message, protocol.TitleUpdated):
            pass
        elif isinstance(message, protocol.AcceptInteraction):
            pass
        elif isinstance(message, protocol.LlmCall):
            output("Waiting for LLM...", INFO_COLOR)
        elif isinstance(message, protocol.AssistantMessageResponse):
            output("\nAssistant:", ASSISTANT_RESPONSE_COLOR)
            print(replace_artifact_tags(
                message.message_chunk, self.thread.state.artifacts))
        elif isinstance(message, protocol.AssistantCodeResponse):
            output("\nAssistant written code:", CODE_COLOR)
            print(message.code_chunk)
        elif isinstance(message, protocol.ExecutingCode):
            output("\nExecuting code...\n", INFO_COLOR)
        elif isinstance(message, protocol.CodeOutput):
            print(message.output_chunk)
        elif isinstance(message, protocol.CodeError):
            output("Code error:", ERROR_COLOR)
            output(message.error, ERROR_COLOR)
        elif isinstance(message, protocol.ArtifactUpdate):
            pass
        elif isinstance(message, protocol.UserConfirmationRequest):
            self.user_confirmation_request = message
        elif isinstance(message, protocol.ServerCompletion):
            pass
        else:
            output(f"Received unknown message type: {message}", ERROR_COLOR)

    @override
    async def recv(self) -> protocol.ClientMessage:
        if not self.inited:
            self.inited = True
            return protocol.ClientInit(type='client_init', version="v1")
        elif not self.sent_user_message:
            self.sent_user_message = True
            return protocol.UserMessage(type='user_message', message=self.user_input)
        else:
            assert self.user_confirmation_request is not None
            response = single_line_input(
                f"Confirm SQL Execution? {
                    self.user_confirmation_request.message} (y/n): ",
                USER_INPUT_COLOR).lower()
            if response == 'y' or response == 'yes':
                response = "approve"
            else:
                response = "deny"
            confirmation_response = protocol.UserConfirmationResponse(
                type='user_confirmation_response',
                confirmation_request_id=self.user_confirmation_request.confirmation_request_id,
                response=response)
            self.user_confirmation_request = None
            return confirmation_response


async def amain():
    parser = argparse.ArgumentParser("CLI based PromptQL playground")
    add_promptql_config_args(parser)
    promptql_config = build_promptql_config(parser.parse_args())
    output("=== PromptQL Playground ===", Colors.RED)
    thread = new_thread()
    while True:
        print()
        user_input = single_line_input("User", USER_INPUT_COLOR)
        print()
        websocket = CliPromptQlWebsocket(user_input=user_input, thread=thread)
        await run_thread(
            llm=promptql_config.llm,
            websocket=websocket,
            sql_engine=promptql_config.ddn,
            thread=thread
        )


def main():
    asyncio.run(amain())


if __name__ == "__main__":
    main()
