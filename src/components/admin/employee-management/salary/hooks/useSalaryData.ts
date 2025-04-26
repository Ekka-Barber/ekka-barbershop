
import { useState, useEffect } from 'react';
import { useSalaryQueries } from './useSalaryQueries';
import { useSalaryCalculation } from './useSalaryCalculation';
import { useEmployeeTransactions } from './useEmployeeTransactions';
import { UseSalaryDataProps, UseSalaryDataResult, EmployeeSalary, asRecord } from './utils/salaryTypes';
import { Employee } from '@/types/employee';

/**
 * Main hook for salary data management
 * Composes smaller hooks for better maintainability
 */
export const useSalaryData = ({ 
  employees, 
  selectedMonth 
}: UseSalaryDataProps): UseSalaryDataResult => {
  const [salaryData, setSalaryData] = useState<EmployeeSalary[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [cachedSalaryData, setCachedSalaryData] = useState<Record<string, EmployeeSalary[]>>({});
  const [lastCalculationTime, setLastCalculationTime] = useState<Record<string, number>>({});
  
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
    employees: employees as Employee[] // Type assertion here as employees should match the required structure
  });

  // Custom refresh function that clears cache for the current month
  const refreshWithCacheClear = () => {
    // Clear cache for current month
    setCachedSalaryData(prev => {
      const newCache = {...prev};
      delete newCache[selectedMonth];
      return newCache;
    });
    // Call the original refresh function
    refreshData();
  };
  
  useEffect(() => {
    if (
      isDataLoading || 
      employees.length === 0
    ) {
      return;
    }
    
    // Check if we have cached data for this month that's less than 5 minutes old
    const currentTime = Date.now();
    const cacheAge = currentTime - (lastCalculationTime[selectedMonth] || 0);
    const CACHE_VALIDITY = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    if (cachedSalaryData[selectedMonth] && cacheAge < CACHE_VALIDITY) {
      setSalaryData(cachedSalaryData[selectedMonth]);
      return;
    }
    
    const performCalculation = async () => {
      setIsCalculating(true);
      
      try {
        // Convert Supabase Json types to Record<string, unknown>
        const typedSalaryPlans = salaryPlans.map(plan => ({
          ...plan,
          config: asRecord(plan.config)
        }));
        
        const calculatedSalaries = await calculateSalaries({
          employees: employees as Employee[], // Type assertion here as employees should match the required structure
          selectedMonth,
          salesData,
          salaryPlans: typedSalaryPlans,
          bonuses,
          deductions,
          loans
        });
        
        setSalaryData(calculatedSalaries);
        
        // Cache the results
        setCachedSalaryData(prev => ({
          ...prev,
          [selectedMonth]: calculatedSalaries
        }));
        
        // Record calculation time
        setLastCalculationTime(prev => ({
          ...prev,
          [selectedMonth]: Date.now()
        }));
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
    refreshData: refreshWithCacheClear
  };
};
