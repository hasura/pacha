from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import override

from promptql.llm import Llm


class Summarizer(ABC):
    @abstractmethod
    async def summarize(self, instructions: str, input: str) -> str:
        ...


@dataclass
class LlmSummarizer(Summarizer):
    llm: Llm

    @override
    async def summarize(self, instructions: str, input: str) -> str:
        system_prompt = f"""
            You are a summarization tool. Given the input from the user, summarize it according to these instructions. Response only with the summarized text and nothing else (eg: no fluff words like "here is the summary", and no chatting to the user).
            {instructions}
        """
        return await self.llm.ask(input, system_prompt)
