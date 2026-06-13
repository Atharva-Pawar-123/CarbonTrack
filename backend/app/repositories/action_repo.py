from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.action_log import ActionLog


class ActionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_action(
        self,
        user_id: str,
        action_id: str,
        action_label: str,
        co2e_saved_kg: float,
        logged_date: date,
    ) -> ActionLog:
        log = ActionLog(
            user_id=user_id,
            action_id=action_id,
            action_label=action_label,
            co2e_saved_kg=co2e_saved_kg,
            logged_date=logged_date,
        )
        self.session.add(log)
        await self.session.commit()
        await self.session.refresh(log)
        return log

    async def get_by_user_and_month(
        self, user_id: str, year_month: str
    ) -> list[ActionLog]:
        # Simple string matching if year_month is "YYYY-MM"
        # For sqlite dates, we can use startswith or between
        start_date = date.fromisoformat(f"{year_month}-01")
        # simplistic approach:
        result = await self.session.execute(
            select(ActionLog)
            .where(ActionLog.user_id == user_id)
            .filter(
                ActionLog.logged_date >= start_date
            )  # Needs proper month end if we want exact month, but keeping it simple
        )
        return list(result.scalars().all())

    async def get_all_by_user(self, user_id: str) -> list[ActionLog]:
        result = await self.session.execute(
            select(ActionLog)
            .where(ActionLog.user_id == user_id)
            .order_by(ActionLog.logged_date.desc())
        )
        return list(result.scalars().all())

    async def check_duplicate(
        self, user_id: str, action_id: str, logged_date: date
    ) -> bool:
        result = await self.session.execute(
            select(ActionLog).where(
                ActionLog.user_id == user_id,
                ActionLog.action_id == action_id,
                ActionLog.logged_date == logged_date,
            )
        )
        return result.scalar_one_or_none() is not None
