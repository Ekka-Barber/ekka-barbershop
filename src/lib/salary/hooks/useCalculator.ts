
import { useState } from 'react';
import { SalaryCalculatorFactory } from '../calculators/CalculatorFactory';
import { SalaryPlanType, Transaction } from '../types/salary';
import { UseSalaryCalculationParams, SalaryCalculationResult } from './utils/types';

/**
 * Hook to handle salary calculator logic
 */
export const useCalculator = ({
  employee,
  plan,
  transactionData,
  salesAmount,
  selectedMonth
}: {
  employee: UseSalaryCalculationParams['employee'];
  plan: any;
  transactionData: {
    bonuses: Transaction[];
    deductions: Transaction[];
    loans: Transaction[];
  };
  salesAmount: number;
  selectedMonth: string;
}): {
  calculate: () => Promise<void>;
  calculationResult: SalaryCalculationResult;
  setCalculationResult: React.Dispatch<React.SetStateAction<SalaryCalculationResult>>;
} => {
  const INITIAL_RESULT: SalaryCalculationResult = {
    baseSalary: 0,
    commission: 0,
    targetBonus: 0,
    regularBonus: 0,
    deductions: 0,
    loans: 0,
    totalSalary: 0,
    planType: null,
    planName: null,
    isLoading: true,
    error: null,
    calculate: async () => {},
    calculationDone: false,
    details: []
  };

  const [calculationResult, setCalculationResult] = useState<SalaryCalculationResult>(INITIAL_RESULT);
  
  const calculate = async () => {
    try {
      if (!plan) {
        setCalculationResult({
          ...INITIAL_RESULT,
          isLoading: false,
          error: 'No salary plan found for this employee',
          calculate,
          calculationDone: true
        });
        return;
      }
      
      // Get the appropriate calculator for this plan type
      const factory = SalaryCalculatorFactory.getInstance();
      const calculator = factory.getCalculator(plan.type as SalaryPlanType);
      
      // Perform calculation
      const result = await calculator.calculate({
        employee,
        plan,
        salesAmount,
        bonuses: transactionData.bonuses,
        deductions: transactionData.deductions,
        loans: transactionData.loans,
        selectedMonth
      });
      
      // Transform CalculatorResult to SalaryCalculationResult
      setCalculationResult({
        baseSalary: result.baseSalary,
        commission: result.commission,
        targetBonus: result.targetBonus || 0, 
        regularBonus: result.bonus || 0, 
        deductions: result.deductions || 0,
        loans: result.loans || 0,
        totalSalary: result.total || 0,
        planType: (result.planType as SalaryPlanType) || plan.type,
        planName: result.planName || plan.name,
        isLoading: false,
        error: result.error || null,
        calculate,
        calculationDone: true,
        details: result.details || [],
        bonusList: transactionData.bonuses,
        deductionsList: transactionData.deductions
      });
    } catch (error) {
      console.error('Error calculating salary:', error);
      setCalculationResult({
        ...INITIAL_RESULT,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        calculate,
        calculationDone: true
      });
    }
  };
  
  return {
    calculate,
    calculationResult,
    setCalculationResult
  };
};
