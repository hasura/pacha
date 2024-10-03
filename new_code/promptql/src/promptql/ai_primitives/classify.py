from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import override

from promptql.llm import Llm


class Classifier(ABC):
    @abstractmethod
    async def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
        ...


@dataclass
class LlmClassifier(Classifier):
    llm: Llm

    @override
    async def classify(self, instructions: str, inputs_to_classify: list[str], categories: list[str], allow_multiple: bool) -> list[str | list[str]]:
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
            answer = (await self.llm.ask(input, system_prompt)).strip()
            if allow_multiple:
                if answer == 'None':
                    output.append([])
                else:
                    output.append(answer.split('\n'))
            else:
                output.append(answer)
        return output
