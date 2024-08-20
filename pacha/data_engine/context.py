from dataclasses import dataclass, field
from typing import Optional
from pacha.data_engine.artifacts import Artifacts
from pacha.data_engine.user_confirmations import UserConfirmationProvider

@dataclass
class ExecutionContext:
    artifacts: Artifacts = field(default_factory=Artifacts)
    confirmation_provider: Optional[UserConfirmationProvider] = None