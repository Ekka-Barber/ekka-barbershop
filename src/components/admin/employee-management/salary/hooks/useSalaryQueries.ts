
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getMonthDateRange } from './utils/dateUtils';

/**
 * Hook to fetch all the data needed for salary calculations
 */
export const useSalaryQueries = (selectedMonth: string) => {
  const { startDate, endDate } = getMonthDateRange(selectedMonth);
  
  // Query for employee sales data
  const salesQuery = useQuery({
    queryKey: ['employee-sales', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .gte('month', startDate)
        .lte('month', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Query for salary plans
  const plansQuery = useQuery({
    queryKey: ['salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*');
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Query for employee bonuses
  const bonusesQuery = useQuery({
    queryKey: ['employee-bonuses', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Query for employee deductions
  const deductionsQuery = useQuery({
    queryKey: ['employee-deductions', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Query for employee loans
  const loansQuery = useQuery({
    queryKey: ['employee-loans', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) throw error;
      return data || [];
    }
  });
  
  const isLoading = 
    salesQuery.isLoading || 
    plansQuery.isLoading || 
    bonusesQuery.isLoading || 
    deductionsQuery.isLoading || 
    loansQuery.isLoading;
  
  const refreshData = () => {
    salesQuery.refetch();
    plansQuery.refetch();
    bonusesQuery.refetch();
    deductionsQuery.refetch();
    loansQuery.refetch();
  };
  
  return {
    salesData: salesQuery.data || [],
    salaryPlans: plansQuery.data || [],
    bonuses: bonusesQuery.data || [],
    deductions: deductionsQuery.data || [],
    loans: loansQuery.data || [],
    isLoading,
    refreshData
  };
};
