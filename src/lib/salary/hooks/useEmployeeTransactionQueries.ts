
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TransactionQueryResult } from './utils/types';
import { EmployeeBonus, EmployeeDeduction, EmployeeLoan } from '../types/salary';
import { getLastDayOfMonth } from './utils/getLastDayOfMonth';

/**
 * Hook to fetch employee transactions (bonuses, deductions, loans) for a specific month
 */
export const useEmployeeTransactionQueries = (
  employeeId: string, 
  selectedMonth: string
) => {
  // Get employee bonuses for the selected month
  const bonusesQuery = useQuery<EmployeeBonus[], Error>({
    queryKey: ['employee-bonuses', employeeId, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeBonus[];
    }
  });
  
  // Get employee deductions for the selected month
  const deductionsQuery = useQuery<EmployeeDeduction[], Error>({
    queryKey: ['employee-deductions', employeeId, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeDeduction[];
    }
  });
  
  // Get employee loans for the selected month
  const loansQuery = useQuery<EmployeeLoan[], Error>({
    queryKey: ['employee-loans', employeeId, selectedMonth],
    queryFn: async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = getLastDayOfMonth(selectedMonth);
      
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (error) throw error;
      return data as EmployeeLoan[];
    }
  });

  const transactionResults: {
    bonuses: TransactionQueryResult<EmployeeBonus>;
    deductions: TransactionQueryResult<EmployeeDeduction>;
    loans: TransactionQueryResult<EmployeeLoan>;
  } = {
    bonuses: { 
      data: bonusesQuery.data || [], 
      isLoading: bonusesQuery.isLoading 
    },
    deductions: { 
      data: deductionsQuery.data || [], 
      isLoading: deductionsQuery.isLoading 
    },
    loans: { 
      data: loansQuery.data || [], 
      isLoading: loansQuery.isLoading 
    }
  };
  
  return {
    transactionResults,
    isLoading: bonusesQuery.isLoading || deductionsQuery.isLoading || loansQuery.isLoading
  };
};
