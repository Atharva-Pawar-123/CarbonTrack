"""
Carbon Footprint Emission Factors and Constants

Sources:
- IPCC AR6 (2021): transport and energy factors
- IEA World Energy Outlook 2023: electricity grid intensities
- CEA India 2023: India grid emission factor
- Oxford University Food and Climate Research Network: diet emission factors
"""

# kg CO2e/km
TRANSPORT_FACTORS: dict[str, float] = {
    "petrol car": 0.192,
    "diesel car": 0.171,
    "electric car": 0.053,
    "hybrid car": 0.111,
    "motorbike": 0.114,
    "short-haul flight": 0.255, # RF multiplier applies in calc
    "long-haul flight": 0.195,  # RF multiplier applies in calc
    "bus": 0.089,
    "metro/train": 0.041,
}

# kg CO2e per unit
ENERGY_FACTORS: dict[str, float] = {
    "electricity_india": 0.82, # per kWh
    "gas": 2.04,               # per m3
    "lpg_cylinder": 29.0,      # per 14.2kg cylinder
}

# kg CO2e per day
DIET_FACTORS: dict[str, float] = {
    "meat_heavy": 7.19,
    "omnivore": 5.63,
    "no_beef": 3.91,
    "vegetarian": 3.81,
    "vegan": 2.89,
}

# kg CO2e per item
CONSUMPTION_FACTORS: dict[str, float] = {
    "clothing_item": 20.0,
    "electronics_device": 100.0,
}

WASTE_MODIFIERS: dict[str, float] = {
    "none": 0.20,
    "partial": 0.0,
    "full": -0.15,
}

# 1.9 tonnes / 12 months = ~158.33? Prompt says 190.0 (1.9 tonnes / 12 months is wrong math in prompt but explicitly asks for 190.0)
INDIA_MONTHLY_AVERAGE_KG: float = 190.0

ECO_ACTIONS: list[dict] = [
    {"id": "public_transport", "label": "Take public transport instead of driving", "co2e_saved_kg": 2.5},
    {"id": "skip_meat", "label": "Skip meat for a day", "co2e_saved_kg": 2.7},
    {"id": "air_dry_laundry", "label": "Air-dry laundry", "co2e_saved_kg": 1.2},
    {"id": "lights_off", "label": "Turn off lights and fans when leaving", "co2e_saved_kg": 0.5},
    {"id": "short_shower", "label": "Take a 5-minute shower", "co2e_saved_kg": 0.8},
    {"id": "plant_tree", "label": "Plant a tree", "co2e_saved_kg": 5.0},
    {"id": "reusable_bag", "label": "Use a reusable shopping bag", "co2e_saved_kg": 0.2},
]
