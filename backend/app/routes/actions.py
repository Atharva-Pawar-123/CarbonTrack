import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.action import (
    LogActionRequest,
    ActionLogResponse,
    ActionSummaryResponse,
)
from app.repositories.action_repo import ActionRepository
from app.services.action_service import ActionService
from app.constants import ECO_ACTIONS

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/actions", tags=["actions"])


@router.post("/", response_model=ActionLogResponse)
async def log_action(
    request: LogActionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = ActionRepository(db)

    # Check duplicate
    is_dup = await repo.check_duplicate(
        current_user.id, request.action_id, request.logged_date
    )
    if is_dup:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Action already logged for this date",
        )

    action_def = next((a for a in ECO_ACTIONS if a["id"] == request.action_id), None)
    if not action_def:
        raise HTTPException(status_code=400, detail="Invalid action ID")

    action_log = await repo.log_action(
        user_id=current_user.id,
        action_id=request.action_id,
        action_label=action_def["label"],
        co2e_saved_kg=action_def["impact_kg"],
        logged_date=request.logged_date,
    )

    return action_log


@router.get("/summary", response_model=ActionSummaryResponse)
async def get_action_summary(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    service = ActionService()
    summary = await service.compute_summary(current_user.id, db)
    return summary
