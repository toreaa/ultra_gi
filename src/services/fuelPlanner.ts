/**
 * Fuel Planner Service
 *
 * Generates optimal fuel plans using a greedy algorithm.
 * Target: 90-110% of carbohydrate requirement.
 */

import { FuelProduct } from '../types/database';
import { FuelPlan, FuelPlanItem } from '../types/fuelPlan';

/**
 * Generate fuel plan using greedy algorithm
 * Sorts products by carbs (descending), selects best fit
 * Target: 90-110% of carb requirement
 */
export function generateFuelPlan(
  targetCarbs: number,
  durationMinutes: number,
  availableProducts: FuelProduct[]
): FuelPlan {
  const items: FuelPlanItem[] = [];
  let remainingCarbs = targetCarbs;

  // Sort by carbs per serving (descending) - greedy approach
  const sorted = [...availableProducts].sort((a, b) =>
    b.carbs_per_serving - a.carbs_per_serving
  );

  for (const product of sorted) {
    if (remainingCarbs <= 0) break;

    // Calculate quantity needed, max 5 units per product
    const quantity = Math.min(
      Math.ceil(remainingCarbs / product.carbs_per_serving),
      5
    );

    const carbsTotal = product.carbs_per_serving * quantity;

    items.push({
      fuel_product_id: product.id,
      product_name: product.name,
      quantity,
      carbs_per_serving: product.carbs_per_serving,
      timing_minutes: generateTiming(durationMinutes, quantity),
      carbs_total: carbsTotal,
    });

    remainingCarbs -= carbsTotal;
  }

  const totalCarbs = items.reduce((sum, item) => sum + item.carbs_total, 0);

  return {
    items,
    total_carbs: totalCarbs,
    target_carbs: targetCarbs,
    percentage: Math.round((totalCarbs / targetCarbs) * 100),
  };
}

/**
 * Generate timing suggestions
 * Distributes intake evenly across session duration
 * Example: 75 min, 3 items → [19, 38, 56]
 */
export function generateTiming(duration: number, quantity: number): number[] {
  if (quantity === 0) return [];
  const interval = duration / (quantity + 1);
  return Array.from({ length: quantity }, (_, i) =>
    Math.round((i + 1) * interval)
  );
}

/**
 * Recalculate plan totals after manual adjustments
 */
export function recalculatePlan(
  items: FuelPlanItem[],
  targetCarbs: number
): FuelPlan {
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs_total, 0);
  return {
    items,
    total_carbs: totalCarbs,
    target_carbs: targetCarbs,
    percentage: Math.round((totalCarbs / targetCarbs) * 100),
  };
}
