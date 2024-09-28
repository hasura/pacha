from abc import ABC, abstractmethod


class ConfirmationProvider(ABC):
    @abstractmethod
    async def request_confirmation(self, sql: str) -> bool:
        ...
