from .auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from .footprint import TransportInput, EnergyInput, DietInput, ConsumptionInput, FootprintCalculateRequest, FootprintEntryResponse, FootprintListResponse
from .action import LogActionRequest, ActionLogResponse, ActionSummaryResponse
from .goal import CreateGoalRequest, GoalResponse

__all__ = [
    "RegisterRequest", "LoginRequest", "TokenResponse", "UserResponse",
    "TransportInput", "EnergyInput", "DietInput", "ConsumptionInput", "FootprintCalculateRequest", "FootprintEntryResponse", "FootprintListResponse",
    "LogActionRequest", "ActionLogResponse", "ActionSummaryResponse",
    "CreateGoalRequest", "GoalResponse"
]
