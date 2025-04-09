
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';
import { SalaryCalculatorFactory } from '../calculators/CalculatorFactory';
import { 
  SalaryPlan, 
  SalaryCalculationResult, 
  EmployeeBonus, 
  EmployeeDeduction,
  EmployeeLoan,
  SalaryPlanType,
  SalaryDetail,
  CalculationResult
} from '../types/salary';

interface UseSalaryCalculationParams {
  employee: Employee;
  salesAmount: number;
  selectedMonth: string; // Format: YYYY-MM
}

const INITIAL_RESULT: SalaryCalculationResult = {
  baseSalary: 0,
  commission: 0,
  targetBonus: 0,
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

export const useSalaryCalculation = ({ 
  employee, 
  salesAmount, 
  selectedMonth 
}: UseSalaryCalculationParams) => {
  const [calculationResult, setCalculationResult] = useState<SalaryCalculationResult>(INITIAL_RESULT);
  
  // Get the salary plan
  const { data: salaryPlan, isLoading: isPlanLoading } = useQuery({
    queryKey: ['employee-salary-plan', employee.salary_plan_id],
    queryFn: async () => {
      if (!employee.salary_plan_id) return null;
      
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .eq('id', employee.salary_plan_id)
        .single();
      
      if (error) throw error;
      return data as SalaryPlan;
    },
    enabled: !!employee.salary_plan_id
  });
  
  // Get employee bonuses for the selected month
  const { data: bonuses = [], isLoading: isBonusesLoading } = useQuery({
    queryKey: ['employee-bonuses', employee.id, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeBonus[];
    }
  });
  
  // Get employee deductions for the selected month
  const { data: deductions = [], isLoading: isDeductionsLoading } = useQuery({
    queryKey: ['employee-deductions', employee.id, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeDeduction[];
    }
  });
  
  // Get employee loans for the selected month
  const { data: loans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ['employee-loans', employee.id, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeLoan[];
    }
  });
  
  // Helper function to get the last day of a month
  const getLastDayOfMonth = (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
  };
  
  const isLoading = isPlanLoading || isBonusesLoading || isDeductionsLoading || isLoansLoading;
  
  // Calculate function
  const calculate = async () => {
    try {
      if (!salaryPlan) {
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
      const calculator = factory.getCalculator(salaryPlan.type as SalaryPlanType);
      
      // Perform calculation
      const result = await calculator.calculate({
        employee,
        plan: salaryPlan,
        salesAmount,
        bonuses: bonuses as EmployeeBonus[],
        deductions: deductions as EmployeeDeduction[],
        loans: loans as EmployeeLoan[],
        selectedMonth
      }) as CalculationResult;
      
      // Make sure the result matches SalaryCalculationResult structure
      setCalculationResult({
        baseSalary: result.baseSalary,
        commission: result.commission,
        targetBonus: result.targetBonus || 0,
        deductions: result.deductions || 0,
        loans: result.loans || 0,
        totalSalary: result.totalSalary || 0,
        planType: result.planType,
        planName: result.planName,
        isLoading: false,
        error: result.error,
        calculate,
        calculationDone: true,
        details: result.details || []
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
  
  // Automatically calculate when dependencies change
  useEffect(() => {
    if (!isLoading) {
      calculate();
    }
  }, [salaryPlan, bonuses, deductions, loans, salesAmount, selectedMonth]);
  
  // Include loading state
  useEffect(() => {
    if (isLoading) {
      setCalculationResult({
        ...INITIAL_RESULT,
        isLoading: true,
        calculate,
        calculationDone: false
      });
    }
  }, [isLoading]);
  
  return calculationResult;
}; 
