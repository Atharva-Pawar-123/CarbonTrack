from datetime import datetime
from typing import Literal, Dict
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class TransportInput(BaseModel):
    car_km: float = Field(default=0.0, ge=0.0)
    fuel_type: Literal["petrol", "diesel", "electric", "hybrid"] = "petrol"
    flight_km_short: float = Field(default=0.0, ge=0.0)
    flight_km_long: float = Field(default=0.0, ge=0.0)
    bus_km: float = Field(default=0.0, ge=0.0)
    metro_km: float = Field(default=0.0, ge=0.0)
    motorbike_km: float = Field(default=0.0, ge=0.0)


class EnergyInput(BaseModel):
    electricity_kwh: float = Field(default=0.0, ge=0.0)
    gas_m3: float = Field(default=0.0, ge=0.0)
    lpg_cylinders: float = Field(default=0.0, ge=0.0)
    region_grid_factor: float = Field(default=0.82, ge=0.1, le=2.0)


class DietInput(BaseModel):
    diet_type: Literal["meat_heavy", "omnivore", "no_beef", "vegetarian", "vegan"]


class ConsumptionInput(BaseModel):
    clothing_items: int = Field(default=0, ge=0)
    electronics_bought: int = Field(default=0, ge=0)
    waste_recycling: Literal["none", "partial", "full"] = "partial"


class FootprintCalculateRequest(BaseModel):
    month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    transport: TransportInput
    energy: EnergyInput
    diet: DietInput
    consumption: ConsumptionInput


class FootprintEntryResponse(BaseModel):
    id: UUID
    user_id: UUID
    month: str
    transport_kg: float
    energy_kg: float
    diet_kg: float
    consumption_kg: float
    total_kg: float
    eco_score: int
    ai_insight: str | None
    transport_detail: Dict[str, float]
    energy_detail: Dict[str, float]
    diet_detail: Dict[str, float]
    consumption_detail: Dict[str, float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FootprintListResponse(BaseModel):
    entries: list[FootprintEntryResponse]
    total: int
