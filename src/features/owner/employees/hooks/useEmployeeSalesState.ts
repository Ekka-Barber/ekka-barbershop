import { format } from 'date-fns';
import { useState } from 'react';

import { DynamicField } from '@shared/types/business/calculations';

interface SalaryCalculation {
  employeeName: string;
  sales: number;
  basicSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  extraBonuses: number;
}

export const useEmployeeSalesState = () => {
  const [salesInputs, setSalesInputs] = useState<Record<string, string>>({});
  const [deductionsFields, setDeductionsFields] = useState<
    Record<string, DynamicField[]>
  >({});
  const [bonusFields, setBonusFields] = useState<
    Record<string, DynamicField[]>
  >({});
  const [loanFields, setLoanFields] = useState<Record<string, DynamicField[]>>(
    {}
  );
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return format(new Date(), 'yyyy-MM');
  });

  return {
    salesInputs,
    setSalesInputs,
    deductionsFields,
    setDeductionsFields,
    bonusFields,
    setBonusFields,
    loanFields,
    setLoanFields,
    calculations,
    setCalculations,
    selectedMonth,
    setSelectedMonth,
  };
};
