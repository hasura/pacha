from __future__ import annotations

from dataclasses import dataclass, field
from pacha.query_planner.data_context import *
from abc import ABC, abstractmethod


@dataclass
class Turn(ABC):
    @abstractmethod
    def render_for_prompt(self) -> str:
        ...


@dataclass
class UserTurn(Turn):
    text: str

    def render_for_prompt(self):
        return f'User: {self.text}'


@dataclass
class AssistantTurn(Turn):
    text: str

    def render_for_prompt(self):
        return f'Assistant: {self.text}'


@dataclass
class QueryPlannerTurn(Turn):
    data_context: DataContext

    def render_for_prompt(self):
        # return f'Executed Python Code: { ("\n```\n" + str(self.data_context.query_plan.python_code) + "```") if self.data_context.data is not None else "None"}'
        # Giving it the python code from previous turns makes it assume that it's executing in a continuous script which makes it refer to non-existent variables.
        return ""


@dataclass
class QueryPlanningInput:
    turns: list[Turn] = field(default_factory=list)

    def as_user_prompt(self, max_length: int, max_turns: int) -> str:
        prompt = ""
        for turn in reversed(self.turns):
            rendered = turn.render_for_prompt()
            if len(prompt) + len(rendered) >= max_length:
                break
            prompt = rendered + "\n" + prompt
            if isinstance(turn, UserTurn):
                max_turns -= 1
                if max_turns <= 0:
                    break
        return prompt
