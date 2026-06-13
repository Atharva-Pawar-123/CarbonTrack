from datetime import date
from uuid import UUID
from pydantic import BaseModel, ConfigDict, field_validator
from app.constants import ECO_ACTIONS


class LogActionRequest(BaseModel):
    action_id: str
    logged_date: date

    @field_validator("action_id")
    @classmethod
    def validate_action_id(cls, v: str) -> str:
        valid_ids = [a["id"] for a in ECO_ACTIONS]
        if v not in valid_ids:
            raise ValueError(f"action_id must be one of {valid_ids}")
        return v

    @field_validator("logged_date")
    @classmethod
    def validate_logged_date(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("logged_date cannot be in the future")
        return v


class ActionLogResponse(BaseModel):
    id: UUID
    action_id: str
    action_label: str
    co2e_saved_kg: float
    logged_date: date

    model_config = ConfigDict(from_attributes=True)


class ActionSummaryResponse(BaseModel):
    total_saved_kg: float
    current_streak: int
    longest_streak: int
    logs_this_month: list[ActionLogResponse]
