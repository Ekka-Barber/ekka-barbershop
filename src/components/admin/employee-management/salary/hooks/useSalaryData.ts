
import { useState, useEffect } from 'react';
import { useSalaryQueries } from './useSalaryQueries';
import { useSalaryCalculation } from './useSalaryCalculation';
import { useEmployeeTransactions } from './useEmployeeTransactions';
import { UseSalaryDataProps, UseSalaryDataResult } from './utils/salaryTypes';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';
import { Transaction } from '@/lib/salary/types/salary';

/**
 * Main hook for salary data management
 * Composes smaller hooks for better maintainability
 */
export const useSalaryData = ({ 
  employees, 
  selectedMonth 
}: UseSalaryDataProps): UseSalaryDataResult => {
  const [salaryData, setSalaryData] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Use the extracted query hook
  const { 
    salesData, 
    salaryPlans, 
    bonuses, 
    deductions, 
    loans, 
    isLoading: isDataLoading, 
    refreshData 
  } = useSalaryQueries(selectedMonth);
  
  // Use the salary calculation hook
  const { calculateSalaries, calculationErrors } = useSalaryCalculation();
  
  // Use the transactions hook
  const { getEmployeeTransactions } = useEmployeeTransactions({
    bonuses,
    deductions,
    loans,
    salesData,
    employees
  });
  
  useEffect(() => {
    if (
      isDataLoading || 
      employees.length === 0
    ) {
      return;
    }
    
    const performCalculation = async () => {
      setIsCalculating(true);
      
      try {
        const calculatedSalaries = await calculateSalaries({
          employees,
          selectedMonth,
          salesData,
          salaryPlans,
          bonuses,
          deductions,
          loans
        });
        
        setSalaryData(calculatedSalaries);
      } catch (error) {
        console.error('Error in salary calculation process:', error);
      } finally {
        setIsCalculating(false);
      }
    };
    
    performCalculation();
  }, [
    employees,
    selectedMonth,
    salesData,
    salaryPlans,
    bonuses,
    deductions,
    loans,
    isDataLoading
  ]);
  
  const isLoading = isDataLoading || isCalculating;
  
  return {
    salaryData,
    isLoading,
    getEmployeeTransactions,
    calculationErrors,
    refreshData
  };
};
