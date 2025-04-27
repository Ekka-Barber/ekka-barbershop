import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, lastDayOfMonth } from 'date-fns';
import { EmployeeDeduction, SubmitDeductionData } from '../types/financials';

export const useDeductions = (employeeId: string, currentMonth: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: deductions = [] } = useQuery({
    queryKey: ['employee-deductions', employeeId, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_deductions')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as EmployeeDeduction[];
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const startOfMonth = `${currentMonth}-01`;
    const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');

    const subscription = supabase
      .channel('employee-deductions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_deductions',
          filter: `employee_id=eq.${employeeId} AND date>=${startOfMonth} AND date<=${endOfMonth}`
        },
        () => {
          // Invalidate and refetch when any change occurs
          queryClient.invalidateQueries({ queryKey: ['employee-deductions', employeeId, currentMonth] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [employeeId, currentMonth, queryClient]);

  const addDeductionMutation = useMutation({
    mutationFn: async (deductionData: SubmitDeductionData) => {
      const { error } = await supabase
        .from('employee_deductions')
        .insert([deductionData]);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employeeId, currentMonth] });
    }
  });

  const deleteDeductionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-deductions', employeeId, currentMonth] });
    }
  });

  return {
    deductions,
    errorMessage,
    setErrorMessage,
    addDeductionMutation,
    deleteDeductionMutation
  };
}; 