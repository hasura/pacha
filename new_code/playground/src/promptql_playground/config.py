from dataclasses import dataclass
from typing import Optional
from promptql.llm import Llm


@dataclass
class PromptQlConfig:
    llm: Llm
    ddn_url: str
    ddn_headers: dict[str, str]
    promptql_uri: str
    promptql_secret_key: Optional[str]
