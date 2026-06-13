from app.schemas.footprint import (
    TransportInput,
    EnergyInput,
    DietInput,
    ConsumptionInput,
    FootprintCalculateRequest,
)
from app.constants import (
    TRANSPORT_FACTORS,
    ENERGY_FACTORS,
    DIET_FACTORS,
    CONSUMPTION_FACTORS,
    WASTE_MODIFIERS,
    INDIA_MONTHLY_AVERAGE_KG,
)


class CalculatorService:
    @staticmethod
    def calculate_transport(data: TransportInput) -> dict:
        breakdown = {
            "car": data.car_km * TRANSPORT_FACTORS[f"{data.fuel_type} car"],
            "flight_short": data.flight_km_short
            * TRANSPORT_FACTORS["short-haul flight"]
            * 2.0,
            "flight_long": data.flight_km_long
            * TRANSPORT_FACTORS["long-haul flight"]
            * 2.0,
            "bus": data.bus_km * TRANSPORT_FACTORS["bus"],
            "metro": data.metro_km * TRANSPORT_FACTORS["metro/train"],
            "motorbike": data.motorbike_km * TRANSPORT_FACTORS["motorbike"],
        }
        total_kg = sum(breakdown.values())
        return {"total_kg": total_kg, "breakdown": breakdown}

    @staticmethod
    def calculate_energy(data: EnergyInput) -> dict:
        breakdown = {
            "electricity": data.electricity_kwh * data.region_grid_factor,
            "gas": data.gas_m3 * ENERGY_FACTORS["gas"],
            "lpg": data.lpg_cylinders * ENERGY_FACTORS["lpg_cylinder"],
        }
        total_kg = sum(breakdown.values())
        return {"total_kg": total_kg, "breakdown": breakdown}

    @staticmethod
    def calculate_diet(data: DietInput) -> dict:
        total_kg = DIET_FACTORS[data.diet_type] * 30.0
        breakdown = {
            "daily_rate": float(DIET_FACTORS[data.diet_type]),
            "days_in_month": 30.0,
        }
        return {"total_kg": total_kg, "breakdown": breakdown}

    @staticmethod
    def calculate_consumption(data: ConsumptionInput, energy_kg: float) -> dict:
        breakdown = {
            "clothing": data.clothing_items * CONSUMPTION_FACTORS["clothing_item"],
            "electronics": data.electronics_bought
            * CONSUMPTION_FACTORS["electronics_device"],
        }
        modifier_applied = WASTE_MODIFIERS[data.waste_recycling] * energy_kg
        total_kg = sum(breakdown.values())
        return {
            "total_kg": total_kg,
            "breakdown": breakdown,
            "modifier_applied": modifier_applied,
        }

    @staticmethod
    def compute_eco_score(total_kg: float) -> int:
        score = int(100 - (total_kg / INDIA_MONTHLY_AVERAGE_KG) * 100)
        return min(100, max(0, score))

    @staticmethod
    def compute_full_footprint(request: FootprintCalculateRequest) -> dict:
        transport_res = CalculatorService.calculate_transport(request.transport)
        energy_res = CalculatorService.calculate_energy(request.energy)
        diet_res = CalculatorService.calculate_diet(request.diet)

        consumption_res = CalculatorService.calculate_consumption(
            request.consumption, energy_res["total_kg"]
        )

        energy_kg_modified = (
            energy_res["total_kg"] + consumption_res["modifier_applied"]
        )

        total_kg = (
            transport_res["total_kg"]
            + energy_kg_modified
            + diet_res["total_kg"]
            + consumption_res["total_kg"]
        )
        eco_score = CalculatorService.compute_eco_score(total_kg)

        energy_detail = {
            **energy_res["breakdown"],
            "waste_modifier": consumption_res["modifier_applied"],
        }

        return {
            "transport_kg": transport_res["total_kg"],
            "transport_detail": transport_res["breakdown"],
            "energy_kg": energy_kg_modified,
            "energy_detail": energy_detail,
            "diet_kg": diet_res["total_kg"],
            "diet_detail": diet_res["breakdown"],
            "consumption_kg": consumption_res["total_kg"],
            "consumption_detail": consumption_res["breakdown"],
            "total_kg": total_kg,
            "eco_score": eco_score,
        }
