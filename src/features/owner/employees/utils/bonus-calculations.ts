import type { DynamicField } from '@shared/types/business';
import type { EmployeeBonus } from '@shared/types/domains';

/**
 * Calculate total existing bonuses for an employee
 */
export const calculateTotalExistingBonuses = (
  bonuses: EmployeeBonus[]
): number => {
  return bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
};

/**
 * Calculate total pending bonuses for an employee
 */
export const calculateTotalPendingBonuses = (
  bonuses: DynamicField[]
): number => {
  return bonuses.reduce(
    (sum, bonus) => sum + parseFloat(bonus.amount || '0'),
    0
  );
};

/**
 * Calculate total bonuses (existing + pending) for an employee
 */
export const calculateTotalBonuses = (
  existingBonuses: EmployeeBonus[],
  pendingBonuses: DynamicField[]
): number => {
  const totalExisting = calculateTotalExistingBonuses(existingBonuses);
  const totalPending = calculateTotalPendingBonuses(pendingBonuses);
  return totalExisting + totalPending;
};
