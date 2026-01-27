import { TIME } from '@shared/constants/time';

/**
 * Calculate accrued leave based on start date (1.75 days per month)
 */
export const calculateAccruedLeave = (
  startDate: string | null,
  annualQuota: number
): number => {
  if (!startDate) return annualQuota;

  const today = new Date();
  const employeeStart = new Date(startDate);

  // If start date is in the future, no leave available yet
  if (employeeStart > today) return 0;

  // Calculate months elapsed since start date
  const monthsWorked =
    (today.getFullYear() - employeeStart.getFullYear()) * TIME.MONTHS_PER_YEAR +
    (today.getMonth() - employeeStart.getMonth());

  // Monthly accrual rate (annual quota divided by 12)
  // Example: 21 days annual = 1.75 days per month
  const monthlyAccrual = annualQuota / TIME.MONTHS_PER_YEAR;

  // Calculate accrued leave based on months worked
  // Note: This can exceed annual quota if employee has worked more than 12 months
  const accrued = monthlyAccrual * monthsWorked;

  // Round to 2 decimal places then to nearest 0.25 for practical leave calculations
  return Math.round((Math.round(accrued * 4) / 4) * 100) / 100;
};
