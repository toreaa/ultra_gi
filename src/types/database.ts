// Database model types

export interface User {
  id: number;
  name: string;
  weight_kg?: number;
  onboarded_at: string;
  primary_goal?: string;
  primary_gi_issue?: string;
  created_at: string;
  updated_at: string;
}

export interface FuelProduct {
  id: number;
  user_id: number;
  name: string;
  product_type: 'gel' | 'drink' | 'bar' | 'food';
  carbs_per_serving: number;
  serving_size?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export interface Program {
  id: number;
  name: string;
  description?: string;
  duration_weeks: number;
  target_audience?: string;
  research_source?: string;
  created_at: string;
  is_active: boolean;
}

export interface ProgramSession {
  id: number;
  program_id: number;
  week_number: number;
  session_number: number;
  duration_minutes: number;
  carb_rate_g_per_hour: number;
  intensity_zone?: string;
  notes?: string;
}

export interface UserProgram {
  id: number;
  user_id: number;
  program_id: number;
  started_at: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'paused';
}

export interface SessionLog {
  id: number;
  user_id: number;
  planned_session_id?: number;
  started_at: string;
  ended_at?: string;
  duration_actual_minutes?: number;
  session_status: 'active' | 'completed' | 'abandoned';
  post_session_notes?: string;
  created_at: string;
}

export interface SessionEvent {
  id: number;
  session_log_id: number;
  event_type: 'intake' | 'discomfort' | 'note';
  timestamp_offset_seconds: number;
  actual_timestamp: string;
  data_json: string; // JSON string
  created_at: string;
}

export interface IntakeData {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  carbs_consumed: number;
  was_planned: boolean;
}

export interface DiscomfortData {
  level: 1 | 2 | 3 | 4 | 5;
  type?: 'nausea' | 'cramping' | 'bloating' | 'other';
  notes?: string;
}

export interface NoteData {
  text: string;
}
