import { useQuery } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';

import { getPayrollWindow } from '@/features/owner/employees/utils';

export const useEmployeeTransactions = (
  employeeId: string,
  selectedMonth: string
) => {
  const { windowStartDate, windowEndDate } = getPayrollWindow(selectedMonth);

  // Employee Bonuses Query
  const bonusesQuery = useQuery({
    queryKey: ['employee_bonuses', employeeId, selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', windowStartDate)
        .lte('date', windowEndDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId && !!selectedMonth,
  });

  // Employee Deductions Query
  const deductionsQuery = useQuery({
    queryKey: ['employee_deductions', employeeId, selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', windowStartDate)
        .lte('date', windowEndDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId && !!selectedMonth,
  });

  // Employee Loans Query
  const loansQuery = useQuery({
    queryKey: ['employee_loans', employeeId, selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', windowStartDate)
        .lte('date', windowEndDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId && !!selectedMonth,
  });

  // Employee Sales Query
  const salesQuery = useQuery({
    queryKey: ['employee_sales', employeeId, selectedMonth],
    queryFn: async () => {
      const monthDate = `${selectedMonth}-01`;
      const { data, error } = await supabase
        .from('employee_sales')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('month', monthDate)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      return data || { sales_amount: 0 };
    },
    enabled: !!employeeId && !!selectedMonth,
  });

  return {
    bonuses: bonusesQuery.data || [],
    deductions: deductionsQuery.data || [],
    loans: loansQuery.data || [],
    sales: salesQuery.data || { sales_amount: 0 },
    isLoading:
      bonusesQuery.isLoading ||
      deductionsQuery.isLoading ||
      loansQuery.isLoading ||
      salesQuery.isLoading,
    error:
      bonusesQuery.error ||
      deductionsQuery.error ||
      loansQuery.error ||
      salesQuery.error,
  };
};
