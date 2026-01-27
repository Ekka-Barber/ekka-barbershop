import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { supabase } from '@shared/lib/supabase/client';

import { useEmployeeActions } from './useEmployeeActions';
import { useEmployeeHandlers } from './useEmployeeHandlers';
import { useEmployeeQueries } from './useEmployeeQueries';
import { useEmployeeSalesState } from './useEmployeeSalesState';

export const useEmployeeSales = (selectedBranch: string) => {
  const {
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
  } = useEmployeeSalesState();

  const {
    employees,
    isLoading,
    existingSales,
    monthlyDeductions,
    monthlyLoans,
    monthlyBonuses,
  } = useEmployeeQueries(selectedBranch, selectedMonth);

  const {
    handleCalculate,
    saveDeductions,
    saveBonuses,
    saveLoans,
    saveSales,
    getTotalDeductions,
  } = useEmployeeActions(
    employees,
    salesInputs,
    deductionsFields,
    bonusFields,
    loanFields,
    selectedMonth,
    setCalculations,
    {
      setDeductionsFields,
      setBonusFields,
      setLoanFields,
    }
  );

  const {
    handleSalesChange,
    handleAddDeduction,
    handleRemoveDeduction,
    handleDeductionDescriptionChange,
    handleDeductionAmountChange,
    handleAddBonus,
    handleRemoveBonus,
    handleBonusDescriptionChange,
    handleBonusAmountChange,
    handleBonusDateChange,
    handleAddLoan,
    handleRemoveLoan,
    handleLoanDescriptionChange,
    handleLoanAmountChange,
    handleLoanDateChange,
  } = useEmployeeHandlers(
    setSalesInputs,
    setDeductionsFields,
    setBonusFields,
    setLoanFields
  );

  // Clear calculations and form data when month changes
  useEffect(
    () => {
      setCalculations([]);
      setDeductionsFields({});
      setBonusFields({});
      setLoanFields({});
    },
    [selectedMonth, setCalculations, setDeductionsFields, setBonusFields, setLoanFields]
  );

  const previousSalesRef = useRef<typeof existingSales | null>(null);

  useEffect(
    () => {
      if (existingSales) {
        const salesData: Record<string, string> = {};
        existingSales.forEach((sale) => {
          salesData[sale.employee_name] = sale.sales_amount.toString();
        });

        const prevSales = previousSalesRef.current;
        const isSameData =
          prevSales &&
          existingSales.length === prevSales.length &&
          existingSales.every((sale, index) => {
            const prevSale = prevSales[index];
            return (
              prevSale &&
              sale.employee_name === prevSale.employee_name &&
              sale.sales_amount === prevSale.sales_amount
            );
          });

        if (!isSameData) {
          setSalesInputs(salesData);
          previousSalesRef.current = existingSales;
        }
      }
    },
    [existingSales, setSalesInputs]
  );

  const queryClient = useQueryClient();

  const { mutateAsync: updateSalaryPlanMutation } = useMutation({
    mutationFn: async ({ employeeId, planId }: { employeeId: string; planId: string }) => {
      const { error } = await supabase
        .from('employees')
        .update({ salary_plan_id: planId })
        .eq('id', employeeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', selectedBranch] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const updateSalaryPlan = async (employeeId: string, planId: string) => {
    await updateSalaryPlanMutation({ employeeId, planId });
  };

  return {
    salesInputs,
    deductionsFields,
    bonusFields,
    loanFields,
    calculations,
    setCalculations,
    employees,
    isLoading,
    handleSalesChange,
    handleAddDeduction,
    handleRemoveDeduction,
    handleDeductionDescriptionChange,
    handleDeductionAmountChange,
    handleAddBonus,
    handleRemoveBonus,
    handleBonusDescriptionChange,
    handleBonusAmountChange,
    handleBonusDateChange,
    handleAddLoan,
    handleRemoveLoan,
    handleLoanDescriptionChange,
    handleLoanAmountChange,
    handleLoanDateChange,
    saveDeductions,
    saveBonuses,
    saveLoans,
    saveSales,
    selectedMonth,
    setSelectedMonth,
    getTotalDeductions,
    monthlyDeductions,
    monthlyLoans,
    monthlyBonuses,
    handleCalculate,
    updateSalaryPlan,
  };
};
