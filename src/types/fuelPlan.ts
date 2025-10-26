/**
 * Fuel Plan Types
 *
 * Type definitions for session fuel planning (Epic 4).
 */

export interface FuelPlanItem {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  carbs_per_serving: number;
  timing_minutes: number[];
  carbs_total: number;
}

export interface FuelPlan {
  items: FuelPlanItem[];
  total_carbs: number;
  target_carbs: number;
  percentage: number; // (total_carbs / target_carbs) * 100
}
