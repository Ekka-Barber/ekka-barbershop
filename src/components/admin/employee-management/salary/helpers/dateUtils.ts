
/**
 * Helper function to get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}
