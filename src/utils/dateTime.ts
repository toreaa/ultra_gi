export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function fromISOString(isoString: string): Date {
  return new Date(isoString);
}
