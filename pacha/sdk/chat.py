from dataclasses import dataclass
from typing import Optional
from pacha.query_planner.data_context import DataContext
from pacha.utils.llm import Turn, UserTurn, Chat, Llm
from pacha.query_planner import input, query_planner
from pacha.utils.logging import get_logger

SYSTEM_PROMPT_TEMPLATE = """
{instructions}

The user input may also contain some retrieved contextual data by an external system.
Use that data in your response if it seems relevant, but ignore it if not. Do not respond
as if the data came from the user.
If the retrieved data shows an error, do not mention the type or description of the error.
"""

USER_PROMPT_TEMPLATE = """
{user_query}

Retrieved contextual data:
```
{output}
```
"""

MAX_DATA_CONTEXT_LENGTH = 4000


@dataclass
class PachaChatResponse:
    data_context: DataContext
    llm_response: str


class PachaChat:
    def __init__(self,
                 query_planner: query_planner.QueryPlanner,
                 chat_llm: Llm,
                 chat_llm_instructions: Optional[str] = None):
        self.query_planner = query_planner
        self.planer_input = input.QueryPlanningInput()

        self.chat_llm = chat_llm
        if chat_llm_instructions is None:
            chat_llm_instructions = "You are a helpful assistant."
        self.assistant_chat = Chat(
            system_prompt=SYSTEM_PROMPT_TEMPLATE.format(instructions=chat_llm_instructions))

    def chat(self, user_query: str) -> PachaChatResponse:
        self.planer_input.turns.append(input.UserTurn(user_query))

        data_context = self.query_planner.get_data_context(self.planer_input)

        self.planer_input.turns.append(input.QueryPlannerTurn(data_context))

        if data_context.data is None:
            user_prompt = user_query
        else:
            user_prompt = USER_PROMPT_TEMPLATE.format(
                user_query=user_query, output=data_context.data.output[:MAX_DATA_CONTEXT_LENGTH])

        self.assistant_chat.add_turn(UserTurn(text=user_prompt))

        get_logger().info("Calling Assistant...")
        assistant_turn = self.chat_llm.get_assistant_turn(self.assistant_chat)
        self.assistant_chat.add_turn(assistant_turn)
        assert (assistant_turn.text is not None)
        self.planer_input.turns.append(
            input.AssistantTurn(assistant_turn.text))
        return PachaChatResponse(data_context, assistant_turn.text)
