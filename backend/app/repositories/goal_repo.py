from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.goal import Goal


class GoalRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self, user_id: str, target_month: str, target_kg: float, description: str | None
    ) -> Goal:
        goal = Goal(
            user_id=user_id,
            target_month=target_month,
            target_kg=target_kg,
            description=description,
        )
        self.session.add(goal)
        await self.session.commit()
        await self.session.refresh(goal)
        return goal

    async def get_by_user(self, user_id: str) -> list[Goal]:
        result = await self.session.execute(
            select(Goal)
            .where(Goal.user_id == user_id)
            .order_by(Goal.target_month.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, goal_id: str) -> Goal | None:
        result = await self.session.execute(select(Goal).where(Goal.id == goal_id))
        return result.scalar_one_or_none()

    async def mark_achieved(self, goal_id: str) -> Goal:
        result = await self.session.execute(select(Goal).where(Goal.id == goal_id))
        goal = result.scalar_one_or_none()
        if goal:
            goal.is_achieved = True
            await self.session.commit()
            await self.session.refresh(goal)
        return goal

    async def update_ai_plan(self, goal_id: str, plan_text: str) -> Goal:
        result = await self.session.execute(select(Goal).where(Goal.id == goal_id))
        goal = result.scalar_one_or_none()
        if goal:
            goal.ai_plan = plan_text
            await self.session.commit()
            await self.session.refresh(goal)
        return goal
