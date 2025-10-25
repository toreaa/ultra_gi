export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== '';
}

export function isPositiveNumber(value: number): boolean {
  return value > 0;
}
