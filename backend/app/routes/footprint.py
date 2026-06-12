import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.footprint import FootprintCalculateRequest, FootprintEntryResponse, FootprintListResponse
from app.services.calculator_service import CalculatorService
from app.services.ai_service import AIInsightService
from app.services.goal_service import GoalService
from app.repositories.footprint_repo import FootprintRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/footprint", tags=["footprint"])

@router.post("/", response_model=FootprintEntryResponse)
async def calculate_and_save_footprint(
    request: FootprintCalculateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    calc_result = CalculatorService.compute_full_footprint(request)
    
    repo = FootprintRepository(db)
    entry = await repo.create_or_update(
        user_id=current_user.id,
        month=request.month,
        transport_kg=calc_result["transport_kg"],
        energy_kg=calc_result["energy_kg"],
        diet_kg=calc_result["diet_kg"],
        consumption_kg=calc_result["consumption_kg"],
        total_kg=calc_result["total_kg"],
        eco_score=calc_result["eco_score"],
        transport_detail=calc_result["transport_detail"],
        energy_detail=calc_result["energy_detail"],
        diet_detail=calc_result["diet_detail"],
        consumption_detail=calc_result["consumption_detail"]
    )
    
    # Generate AI insight (will use cache if valid)
    ai_service = AIInsightService()
    await ai_service.get_or_generate_insight(db, entry, current_user)
    
    # Update goal progress
    goal_service = GoalService()
    await goal_service.update_goal_progress(current_user.id, request.month, entry.total_kg, db)
    
    return entry

@router.get("/history", response_model=FootprintListResponse)
async def get_footprint_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = FootprintRepository(db)
    entries = await repo.get_last_n_months(current_user.id, 6)
    return FootprintListResponse(entries=entries, total=len(entries))

@router.post("/{entry_id}/insight", response_model=FootprintEntryResponse)
async def refresh_ai_insight(
    entry_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = FootprintRepository(db)
    entry = await repo.get_by_id(current_user.id, entry_id)
    
    if not entry:
        raise HTTPException(status_code=404, detail="Footprint entry not found")
        
    # Invalidate cache
    entry.insight_generated_at = None
    
    ai_service = AIInsightService()
    await ai_service.get_or_generate_insight(db, entry, current_user)
    
    return entry
