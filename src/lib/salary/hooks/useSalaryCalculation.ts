
import { useState, useEffect } from 'react';
import { Transaction } from '../types/salary';
import { useSalaryPlanQuery } from './useSalaryPlanQuery';
import { useEmployeeTransactionQueries } from './useEmployeeTransactionQueries';
import { useCalculator } from './useCalculator';
import { UseSalaryCalculationParams, SalaryCalculationResult } from './utils/types';

export const useSalaryCalculation = ({
  employee,
  salesAmount,
  selectedMonth
}: UseSalaryCalculationParams): SalaryCalculationResult => {
  // Get the salary plan
  const { data: salaryPlan, isLoading: isPlanLoading } = useSalaryPlanQuery(employee);
  
  // Get transaction data (bonuses, deductions, loans)
  const { 
    transactionResults, 
    isLoading: isTransactionsLoading 
  } = useEmployeeTransactionQueries(employee.id, selectedMonth);

  // Initialize calculator hook
  const { 
    calculate, 
    calculationResult, 
    setCalculationResult 
  } = useCalculator({
    employee,
    plan: salaryPlan,
    transactionData: {
      bonuses: transactionResults.bonuses.data as Transaction[],
      deductions: transactionResults.deductions.data as Transaction[],
      loans: transactionResults.loans.data as Transaction[]
    },
    salesAmount,
    selectedMonth
  });

  // Handle loading state
  const isLoading = isPlanLoading || isTransactionsLoading;
  
  // Automatically calculate when dependencies change
  useEffect(() => {
    if (!isLoading) {
      calculate();
    }
  }, [salaryPlan, 
      transactionResults.bonuses.data, 
      transactionResults.deductions.data, 
      transactionResults.loans.data, 
      salesAmount, 
      selectedMonth,
      isLoading]);
  
  // Update loading state in the result
  useEffect(() => {
    if (isLoading) {
      setCalculationResult(prev => ({
        ...prev,
        isLoading: true,
        calculationDone: false
      }));
    }
  }, [isLoading]);
  
  return calculationResult;
};
