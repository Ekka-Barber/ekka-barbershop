import { useMemo } from 'react';

import type { SalaryCalculationsState } from '../types';

export const useSalaryCalculations = ({
  calculations,
}: {
  calculations: Array<{ totalSalary: number }>;
}): SalaryCalculationsState => {
  // Calculate total payout across all employees (gross salary before loan deductions)
  // This follows international standards where total payout shows full salary obligation
  const totalPayout = useMemo((): number => {
    return calculations.reduce((sum, calc) => sum + calc.totalSalary, 0);
  }, [calculations]);

  return {
    totalPayout,
  };
};
