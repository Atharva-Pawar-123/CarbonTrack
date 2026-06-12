import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.goal import Goal
from app.models.footprint_entry import FootprintEntry
from app.schemas.goal import CreateGoalRequest
from app.repositories.goal_repo import GoalRepository
from app.repositories.footprint_repo import FootprintRepository
from app.services.ai_service import AIInsightService

logger = logging.getLogger(__name__)

class GoalService:
    async def create_goal(self, user_id: str, request: CreateGoalRequest, db: AsyncSession) -> Goal:
        repo = GoalRepository(db)
        goal = await repo.create(
            user_id=user_id,
            target_month=request.target_month,
            target_kg=request.target_kg,
            description=request.description
        )

        footprint_repo = FootprintRepository(db)
        current_entry = await footprint_repo.get_by_month(user_id, request.target_month)
        
        # Fire and forget the AI plan generation
        ai_service = AIInsightService()
        asyncio.create_task(self._generate_plan_bg(ai_service, str(goal.id), str(current_entry.id) if current_entry else None))
        
        return goal

    async def get_user_goals(self, user_id: str, db: AsyncSession) -> list[Goal]:
        repo = GoalRepository(db)
        goals = await repo.get_by_user(user_id)
        
        footprint_repo = FootprintRepository(db)
        # Hydrate current_kg and progress_pct
        for goal in goals:
            entry = await footprint_repo.get_by_month(user_id, goal.target_month)
            if entry:
                goal.current_kg = entry.total_kg
                if goal.target_kg > 0:
                    goal.progress_pct = max(0.0, min(100.0, (entry.total_kg / goal.target_kg) * 100))
                else:
                    goal.progress_pct = 0.0
            else:
                goal.current_kg = 0.0
                goal.progress_pct = 0.0

        return goals

    async def update_goal_progress(self, user_id: str, target_month: str, current_total_kg: float, db: AsyncSession):
        repo = GoalRepository(db)
        goals = await repo.get_by_user(user_id)
        goal = next((g for g in goals if g.target_month == target_month), None)
        
        if goal:
            if current_total_kg <= goal.target_kg and not goal.is_achieved:
                await repo.mark_achieved(goal.id)

    async def _generate_plan_bg(self, ai_service: AIInsightService, goal_id: str, entry_id: str | None):
        from app.core.database import AsyncSessionLocal
        from sqlalchemy.future import select
        
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(select(Goal).where(Goal.id == goal_id))
                goal = result.scalar_one_or_none()
                if not goal:
                    return
                
                current_entry = None
                if entry_id:
                    result = await session.execute(select(FootprintEntry).where(FootprintEntry.id == entry_id))
                    current_entry = result.scalar_one_or_none()
                    
                await ai_service.generate_goal_plan(session, goal, current_entry)
        except Exception as e:
            logger.error(f"Error generating AI plan in background: {e}")
