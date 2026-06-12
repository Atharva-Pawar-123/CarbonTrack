"""
Action Service — streak calculation and summary aggregation.
"""

from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.action_repo import ActionRepository


class ActionService:
    """Business logic for eco-action tracking and streak computation."""

    async def compute_summary(self, user_id: str, db: AsyncSession) -> dict:
        """Compute total saved, current streak, longest streak, and this month's logs."""
        repo = ActionRepository(db)
        all_logs = await repo.get_all_by_user(user_id)

        total_saved_kg = sum(log.co2e_saved_kg for log in all_logs)

        # Extract unique dates sorted ascending
        unique_dates = sorted({log.logged_date for log in all_logs})

        current_streak = self._compute_current_streak(unique_dates)
        longest_streak = self._compute_longest_streak(unique_dates)

        # Logs for this month
        today = date.today()
        year_month = today.strftime("%Y-%m")
        month_logs = await repo.get_by_user_and_month(user_id, year_month)

        return {
            "total_saved_kg": round(total_saved_kg, 2),
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "logs_this_month": month_logs,
        }

    @staticmethod
    def _compute_current_streak(unique_dates: list[date]) -> int:
        """Compute consecutive-day streak ending today or yesterday."""
        if not unique_dates:
            return 0

        today = date.today()
        yesterday = today - timedelta(days=1)

        # Streak must include today or yesterday
        if unique_dates[-1] not in (today, yesterday):
            return 0

        streak = 1
        for i in range(len(unique_dates) - 1, 0, -1):
            if unique_dates[i] - unique_dates[i - 1] == timedelta(days=1):
                streak += 1
            else:
                break
        return streak

    @staticmethod
    def _compute_longest_streak(unique_dates: list[date]) -> int:
        """Compute the longest consecutive-day streak across all time."""
        if not unique_dates:
            return 0

        longest = 1
        current = 1
        for i in range(1, len(unique_dates)):
            if unique_dates[i] - unique_dates[i - 1] == timedelta(days=1):
                current += 1
                longest = max(longest, current)
            else:
                current = 1
        return longest
