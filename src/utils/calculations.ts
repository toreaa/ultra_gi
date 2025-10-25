import { FuelPlan } from '../types/session';

export function calculateTotalCarbs(plan: FuelPlan): number {
  return plan.reduce((sum, item) => sum + item.carbs_total, 0);
}

export function calculateCarbRate(totalCarbs: number, durationMinutes: number): number {
  return (totalCarbs / durationMinutes) * 60; // g/hr
}

export function calculateRequiredCarbs(durationMinutes: number, targetGPerHour: number): number {
  return (durationMinutes / 60) * targetGPerHour;
}
