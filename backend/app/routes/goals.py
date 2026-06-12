import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.goal import CreateGoalRequest, GoalResponse
from app.services.goal_service import GoalService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/goals", tags=["goals"])

@router.post("/", response_model=GoalResponse)
async def create_goal(
    request: CreateGoalRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService()
    goal = await service.create_goal(current_user.id, request, db)
    # The progress won't be calculated immediately for the response, so we mock it for the return type or just let it be defaults
    return goal

@router.get("/", response_model=list[GoalResponse])
async def get_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = GoalService()
    goals = await service.get_user_goals(current_user.id, db)
    return goals
