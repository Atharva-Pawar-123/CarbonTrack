from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator

class CreateGoalRequest(BaseModel):
    target_month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    target_kg: float = Field(gt=0)
    description: str | None = Field(default=None, max_length=500)

    @field_validator('description', mode='before')
    @classmethod
    def sanitize_description(cls, v: str | None) -> str | None:
        if v is None:
            return v
        from app.core.sanitization import sanitize_string
        return sanitize_string(v, max_length=500)

class GoalResponse(BaseModel):
    id: UUID
    user_id: UUID
    target_month: str
    target_kg: float
    description: str | None
    is_achieved: bool = False
    ai_plan: str | None = None
    current_kg: float = 0.0
    progress_pct: float = 0.0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
