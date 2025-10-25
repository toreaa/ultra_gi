// Session-related types
export interface FuelPlanItem {
  fuel_product_id: number;
  product_name: string;
  quantity: number;
  timing_minutes: number;
  carbs_total: number;
}

export type FuelPlan = FuelPlanItem[];
