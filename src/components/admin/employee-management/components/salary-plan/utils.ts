
/**
 * Helper function to get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Helper function to safely format numbers with toLocaleString
 */
export function safeToLocaleString(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString();
}
