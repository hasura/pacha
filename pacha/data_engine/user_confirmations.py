from enum import Enum
from typing import Optional
from dataclasses import dataclass, field
import asyncio
import uuid

CONFIRMATION_TIMEOUT_SECS = 120


class UserConfirmationResult(Enum):
    PENDING = 0
    APPROVED = 1
    DENIED = 2
    TIMED_OUT = 3


@dataclass
class RequestedUserConfirmation:
    # event to notify that a confirmation result was received
    event: asyncio.Event
    result: UserConfirmationResult
    message: str


@dataclass
class UserConfirmationProvider:
    # event to notify that a new confirmation is being requested
    event: asyncio.Event
    # Latest message that needs to be confirmed
    requested: RequestedUserConfirmation = field(init=False)
    # Pending user confirmations
    pending: dict[str, RequestedUserConfirmation] = field(default_factory=dict)

    async def request_confirmation(self, message: str) -> UserConfirmationResult:
        confirmation = RequestedUserConfirmation(
            event=asyncio.Event(), message=message, result=UserConfirmationResult.PENDING)
        self.requested = confirmation
        self.event.set()
        try:
            await asyncio.wait_for(self.requested.event.wait(), CONFIRMATION_TIMEOUT_SECS)
        except TimeoutError:
            confirmation.result = UserConfirmationResult.TIMED_OUT
        return confirmation.result
