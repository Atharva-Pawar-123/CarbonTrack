export const TRANSPORT_FACTORS = {
  "petrol car": 0.192,
  "diesel car": 0.171,
  "electric car": 0.053,
  "hybrid car": 0.111,
  "motorbike": 0.114,
  "short-haul flight": 0.255,
  "long-haul flight": 0.195,
  "bus": 0.089,
  "metro/train": 0.041,
} as const;

export const ENERGY_FACTORS = {
  "electricity_india": 0.82,
  "gas": 2.04,
  "lpg_cylinder": 29.0,
} as const;

export const DIET_FACTORS = {
  "meat_heavy": 7.19,
  "omnivore": 5.63,
  "no_beef": 3.91,
  "vegetarian": 3.81,
  "vegan": 2.89,
} as const;

export const CONSUMPTION_FACTORS = {
  "clothing_item": 20.0,
  "electronics_device": 100.0,
} as const;

export const WASTE_MODIFIERS = {
  "none": 0.20,
  "partial": 0.0,
  "full": -0.15,
} as const;

export const INDIA_MONTHLY_AVERAGE_KG = 190.0;

export const ECO_ACTIONS = [
  { id: "public_transport", label: "Take public transport instead of driving", co2e_saved_kg: 2.5 },
  { id: "skip_meat", label: "Skip meat for a day", co2e_saved_kg: 2.7 },
  { id: "air_dry_laundry", label: "Air-dry laundry", co2e_saved_kg: 1.2 },
  { id: "lights_off", label: "Turn off lights and fans when leaving", co2e_saved_kg: 0.5 },
  { id: "short_shower", label: "Take a 5-minute shower", co2e_saved_kg: 0.8 },
  { id: "plant_tree", label: "Plant a tree", co2e_saved_kg: 5.0 },
  { id: "reusable_bag", label: "Use a reusable shopping bag", co2e_saved_kg: 0.2 },
] as const;
