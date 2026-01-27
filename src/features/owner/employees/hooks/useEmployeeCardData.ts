import { useMemo } from 'react';

import { DynamicField } from '@shared/types/business/calculations';
import { Employee } from '@shared/types/domains';

import { EmployeeCardData } from '../types';

interface UseEmployeeCardDataProps {
  employee: Employee;
  salesValue: string;
  monthlyDeductions: DynamicField[];
  monthlyLoans: DynamicField[];
  monthlyBonuses: DynamicField[];
}

export const useEmployeeCardData = ({
  employee,
  salesValue,
  monthlyDeductions,
  monthlyLoans,
  monthlyBonuses,
}: UseEmployeeCardDataProps): EmployeeCardData => {
  // Memoized totals calculations - expensive operations
  const { totalDeductions, totalLoans, totalBonuses } = useMemo(
    () => ({
      totalDeductions: monthlyDeductions.reduce(
        (sum, d) => sum + parseFloat(d.amount || '0'),
        0
      ),
      totalLoans: monthlyLoans.reduce(
        (sum, l) => sum + parseFloat(l.amount || '0'),
        0
      ),
      totalBonuses: monthlyBonuses.reduce(
        (sum, b) => sum + parseFloat(b.amount || '0'),
        0
      ),
    }),
    [monthlyDeductions, monthlyLoans, monthlyBonuses]
  );

  const salesAmount = useMemo(
    () => parseFloat(salesValue || '0'),
    [salesValue]
  );

  const salesInputId = useMemo(() => `sales-${employee.id}`, [employee.id]);

  return {
    salesInputId,
    totalDeductions,
    totalLoans,
    totalBonuses,
    salesAmount,
  };
};
