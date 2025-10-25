export function formatCarbs(grams: number): string {
  return `${grams}g`;
}

export function formatCarbRate(gPerHour: number): string {
  return `${gPerHour}g/h`;
}

export function formatDurationMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
