import { EmployeeWithSalaryPlan } from '@shared/types/business';
import { DynamicField } from '@shared/types/business/calculations';

import { useEmployeeCalculationActions } from './useEmployeeCalculationActions';
import { useEmployeeRecordActions } from './useEmployeeRecordActions';

interface Calculation {
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

interface EmployeeActionsSetters {
  setDeductionsFields?: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >;
  setBonusFields?: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >;
  setLoanFields?: React.Dispatch<
    React.SetStateAction<Record<string, DynamicField[]>>
  >;
}

export const useEmployeeActions = (
  employees: EmployeeWithSalaryPlan[],
  salesInputs: Record<string, string>,
  deductionsFields: Record<string, DynamicField[]>,
  bonusFields: Record<string, DynamicField[]>,
  loanFields: Record<string, DynamicField[]>,
  selectedMonth: string,
  setCalculations: (calc: Calculation[]) => void,
  setters?: EmployeeActionsSetters
) => {
  const { handleCalculate } = useEmployeeCalculationActions(
    employees,
    salesInputs,
    deductionsFields,
    bonusFields,
    selectedMonth,
    setCalculations
  );

  // Create clear functions for each form type
  const clearDeductionsForEmployee = (employeeName: string) => {
    if (setters?.setDeductionsFields) {
      setters.setDeductionsFields((prev) => ({
        ...prev,
        [employeeName]: [],
      }));
    }
  };

  const clearBonusesForEmployee = (employeeName: string) => {
    if (setters?.setBonusFields) {
      setters.setBonusFields((prev) => ({
        ...prev,
        [employeeName]: [],
      }));
    }
  };

  const clearLoansForEmployee = (employeeName: string) => {
    if (setters?.setLoanFields) {
      setters.setLoanFields((prev) => ({
        ...prev,
        [employeeName]: [],
      }));
    }
  };

  const { saveDeductions, saveBonuses, saveLoans, saveSales } =
    useEmployeeRecordActions(
      employees,
      selectedMonth,
      clearDeductionsForEmployee,
      clearBonusesForEmployee,
      clearLoansForEmployee
    );

  const getTotalDeductions = (employeeName: string) => {
    const deductions =
      deductionsFields[employeeName]?.reduce(
        (sum, d) => sum + Number(d.amount),
        0
      ) || 0;

    return deductions;
  };

  return {
    handleCalculate,
    saveDeductions,
    saveBonuses,
    saveLoans,
    saveSales,
    getTotalDeductions,
  };
};
