import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, lastDayOfMonth } from 'date-fns';
import { EmployeeBonus, SubmitBonusData } from '../types/financials';

export const useBonuses = (employeeId: string, currentMonth: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: bonuses = [] } = useQuery({
    queryKey: ['employee-bonuses', employeeId, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_bonuses')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as EmployeeBonus[];
    }
  });

  const addBonusMutation = useMutation({
    mutationFn: async (bonusData: SubmitBonusData) => {
      const { error } = await supabase
        .from('employee_bonuses')
        .insert([bonusData]);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-bonuses', employeeId, currentMonth] });
    }
  });

  const deleteBonusMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_bonuses')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-bonuses', employeeId, currentMonth] });
    }
  });

  return {
    bonuses,
    errorMessage,
    setErrorMessage,
    addBonusMutation,
    deleteBonusMutation
  };
}; 