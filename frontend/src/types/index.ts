export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface FootprintEntry {
  id: string;
  user_id: string;
  month: string;
  transport_kg: number;
  energy_kg: number;
  diet_kg: number;
  consumption_kg: number;
  total_kg: number;
  eco_score: number;
  ai_insight: string | null;
  transport_detail: Record<string, number>;
  energy_detail: Record<string, number>;
  diet_detail: Record<string, number>;
  consumption_detail: Record<string, number>;
  created_at: string;
}

export interface FootprintBreakdown {
  transport: number;
  energy: number;
  diet: number;
  consumption: number;
}

export interface ActionLog {
  id: string;
  action_id: string;
  action_label: string;
  co2e_saved_kg: number;
  logged_date: string;
}

export interface Goal {
  id: string;
  user_id: string;
  target_month: string;
  target_kg: number;
  description: string;
  is_achieved: boolean;
  ai_plan: string | null;
  current_kg: number;
  progress_pct: number;
  created_at: string;
}

export interface AIInsight {
  insight: string;
  is_cached: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  detail: any;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface EcoAction {
  id: string;
  label: string;
  co2e_saved_kg: number;
}
