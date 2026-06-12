"""
AI Insight Service — Gemini-powered personalized carbon footprint insights.

Features 24-hour database caching and graceful fallback on API failure.
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.footprint_entry import FootprintEntry
from app.models.goal import Goal
from app.models.user import User
from app.repositories.footprint_repo import FootprintRepository
from app.repositories.goal_repo import GoalRepository

logger = logging.getLogger(__name__)

CACHE_TTL = timedelta(hours=24)


class AIInsightService:
    """Generates and caches AI-powered carbon footprint insights via Google Gemini."""

    async def get_or_generate_insight(
        self,
        db: AsyncSession,
        footprint_entry: FootprintEntry,
        user: User,
    ) -> str:
        """Return cached insight if fresh, otherwise generate a new one via Gemini."""
        # Step 1: Check cache
        if self._is_cache_valid(footprint_entry):
            logger.info("Serving cached AI insight for entry %s", footprint_entry.id)
            return footprint_entry.ai_insight

        # Step 2: Build prompt
        prompt = self._build_prompt(footprint_entry, user)

        # Step 3: Call Gemini (with fallback)
        try:
            insight = await self._call_gemini(prompt)
        except Exception as exc:
            logger.error(
                "Gemini API call failed for entry %s: %s",
                footprint_entry.id,
                str(exc),
            )
            insight = self._get_fallback_insight(footprint_entry)

        # Step 4: Persist to DB
        repo = FootprintRepository(db)
        await repo.update_ai_insight(footprint_entry.id, insight)

        # Step 5: Return
        return insight

    async def generate_goal_plan(
        self,
        db: AsyncSession,
        goal: Goal,
        current_entry: FootprintEntry | None,
    ) -> str:
        """Generate a Gemini-powered action plan for a carbon reduction goal."""
        current_kg = current_entry.total_kg if current_entry else None
        gap = (current_kg - goal.target_kg) if current_kg else None

        prompt = (
            f"User wants to reach {goal.target_kg:.1f} kg CO2e by {goal.target_month}. "
            f"Current footprint: {f'{current_kg:.1f}' if current_kg else 'not yet calculated'} kg. "
            f"Gap to close: {f'{gap:.1f}' if gap else 'unknown'} kg. "
            "Generate a 5-step action plan with specific, achievable weekly actions. "
            "Each step must be under 30 words. Total under 200 words."
        )

        try:
            plan = await self._call_gemini(prompt)
        except Exception as exc:
            logger.error("Gemini goal plan failed for goal %s: %s", goal.id, str(exc))
            plan = self._get_fallback_goal_plan()

        repo = GoalRepository(db)
        await repo.update_ai_plan(goal.id, plan)
        return plan

    @staticmethod
    def _is_cache_valid(entry: FootprintEntry) -> bool:
        """Check if the cached insight is still fresh (within 24 hours)."""
        if entry.ai_insight is None or entry.insight_generated_at is None:
            return False
        generated_at = entry.insight_generated_at
        if generated_at.tzinfo is None:
            generated_at = generated_at.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - generated_at) < CACHE_TTL

    @staticmethod
    def _build_prompt(footprint_entry: FootprintEntry, user: User) -> str:
        """Build a rich, context-aware prompt for Gemini."""
        categories = {
            "Transport": footprint_entry.transport_kg,
            "Energy": footprint_entry.energy_kg,
            "Diet": footprint_entry.diet_kg,
            "Consumption": footprint_entry.consumption_kg,
        }
        biggest_category = max(categories, key=categories.get)

        return (
            "You are a warm, encouraging carbon footprint advisor focused on the Indian context. "
            f"The user {user.display_name} has a monthly carbon footprint of "
            f"{footprint_entry.total_kg:.1f} kg CO2e. "
            f"Breakdown: Transport {footprint_entry.transport_kg:.1f} kg, "
            f"Energy {footprint_entry.energy_kg:.1f} kg, "
            f"Diet {footprint_entry.diet_kg:.1f} kg, "
            f"Consumption {footprint_entry.consumption_kg:.1f} kg. "
            f"Their Eco Score is {footprint_entry.eco_score}/100. "
            "India's average is 190 kg/month. "
            f"Their biggest emission source is {biggest_category}. "
            "Provide a response with EXACTLY these 4 sections: "
            f"TIPS: Three numbered, specific, actionable tips tailored to their biggest category. "
            f"FACT: One surprising fun fact about {biggest_category} emissions in India. "
            "COMPARISON: One sentence comparing them to the Indian average. "
            "ENCOURAGEMENT: One warm, motivating sentence. "
            "Total response: under 220 words. Use plain language (no jargon)."
        )

    @staticmethod
    async def _call_gemini(prompt: str) -> str:
        """Call the Gemini API asynchronously with a timeout."""
        import google.generativeai as genai

        def _sync_call() -> str:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=350,
                    temperature=0.7,
                ),
            )
            return response.text

        return await asyncio.wait_for(
            asyncio.to_thread(_sync_call),
            timeout=10.0,
        )

    @staticmethod
    def _get_fallback_insight(footprint_entry: FootprintEntry) -> str:
        """Return a static but helpful fallback when Gemini is unavailable."""
        categories = {
            "Transport": footprint_entry.transport_kg,
            "Energy": footprint_entry.energy_kg,
            "Diet": footprint_entry.diet_kg,
            "Consumption": footprint_entry.consumption_kg,
        }
        biggest = max(categories, key=categories.get)
        return (
            f"Your footprint is {footprint_entry.total_kg:.1f} kg this month. "
            f"Your biggest source is {biggest}. "
            "Try reducing it with small daily changes — every kilogram counts. "
            "We couldn't fetch a personalized tip right now, but check the Learn "
            "page for actionable ideas!"
        )

    @staticmethod
    def _get_fallback_goal_plan() -> str:
        """Return a generic 5-step plan when Gemini is unavailable."""
        return (
            "1. Track your daily transport and switch to public transit twice a week.\n"
            "2. Reduce electricity usage by turning off appliances when not in use.\n"
            "3. Try two meat-free days per week to lower diet emissions.\n"
            "4. Buy fewer new clothing items this month — repair or reuse instead.\n"
            "5. Start recycling household waste to reduce your consumption footprint."
        )
