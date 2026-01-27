export { formatPrice } from '@shared/utils/currency';

/**
 * Calculates the total deductions and loans for an employee
 * @param deductions - Array of employee deductions
 * @param loans - Array of employee loans
 * @returns Total amount of deductions and loans
 */
export const calculateTotalDeductionsAndLoans = (
  deductions: Array<{ amount: number }>,
  loans: Array<{ amount: number }>
): number => {
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const totalLoans = loans.reduce((sum, l) => sum + l.amount, 0);
  return totalDeductions + totalLoans;
};
