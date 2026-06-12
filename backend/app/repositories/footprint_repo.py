from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.footprint_entry import FootprintEntry

class FootprintRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_or_update(self, user_id: str, month: str, **fields) -> FootprintEntry:
        existing = await self.get_by_month(user_id, month)
        if existing:
            for key, value in fields.items():
                setattr(existing, key, value)
            entry = existing
        else:
            entry = FootprintEntry(user_id=user_id, month=month, **fields)
            self.session.add(entry)
        
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def get_by_month(self, user_id: str, month: str) -> FootprintEntry | None:
        result = await self.session.execute(
            select(FootprintEntry).where(
                FootprintEntry.user_id == user_id,
                FootprintEntry.month == month
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: str, entry_id: str) -> FootprintEntry | None:
        result = await self.session.execute(
            select(FootprintEntry).where(
                FootprintEntry.user_id == user_id,
                FootprintEntry.id == entry_id
            )
        )
        return result.scalar_one_or_none()

    async def get_last_n_months(self, user_id: str, n: int = 6) -> list[FootprintEntry]:
        result = await self.session.execute(
            select(FootprintEntry)
            .where(FootprintEntry.user_id == user_id)
            .order_by(FootprintEntry.month.desc())
            .limit(n)
        )
        return list(result.scalars().all())

    async def update_ai_insight(self, entry_id: str, insight_text: str) -> FootprintEntry:
        result = await self.session.execute(select(FootprintEntry).where(FootprintEntry.id == entry_id))
        entry = result.scalar_one_or_none()
        if entry:
            from datetime import datetime, timezone
            entry.ai_insight = insight_text
            entry.insight_generated_at = datetime.now(timezone.utc)
            await self.session.commit()
            await self.session.refresh(entry)
        return entry
