export const HEART_RATE_ZONES = {
  ZONE_1: { min: 0, max: 0.6, label: 'Recovery' },
  ZONE_2: { min: 0.6, max: 0.7, label: 'Endurance' },
  ZONE_3: { min: 0.7, max: 0.8, label: 'Tempo' },
  ZONE_4: { min: 0.8, max: 0.9, label: 'Threshold' },
  ZONE_5: { min: 0.9, max: 1.0, label: 'VO2 Max' },
};

export function getZoneFromHR(hr: number, maxHR: number): number {
  const percentage = hr / maxHR;
  if (percentage < 0.6) return 1;
  if (percentage < 0.7) return 2;
  if (percentage < 0.8) return 3;
  if (percentage < 0.9) return 4;
  return 5;
}
