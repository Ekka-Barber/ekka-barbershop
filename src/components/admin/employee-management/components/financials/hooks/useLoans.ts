import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, lastDayOfMonth } from 'date-fns';
import { EmployeeLoan, SubmitLoanData, CashDeposit } from '../types/financials';

export const useLoans = (employeeId: string, currentMonth: string) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loanSource, setLoanSource] = useState<'other' | 'cash_deposit'>('other');
  const [cashDeposits, setCashDeposits] = useState<CashDeposit[]>([]);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false);
  const queryClient = useQueryClient();

  const { data: loans = [] } = useQuery({
    queryKey: ['employee-loans', employeeId, currentMonth],
    queryFn: async () => {
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = format(lastDayOfMonth(new Date(currentMonth)), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('employee_loans')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth)
        .order('date', { ascending: false });
        
      if (error) throw error;
      return data as EmployeeLoan[];
    }
  });

  const fetchCashDeposits = async () => {
    setIsLoadingDeposits(true);
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase
        .from('cash_deposits')
        .select('id, balance')
        .gt('balance', 0)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cash deposits:', error);
        setErrorMessage(`Error fetching cash deposits: ${error.message}`);
        setCashDeposits([]);
        setSelectedDepositId(null);
        return;
      }
      
      setCashDeposits(data || []);
      if (data && data.length > 0) {
        setSelectedDepositId(data[0].id);
      } else {
        setSelectedDepositId(null);
      }
    } catch (err) {
      console.error('Exception fetching cash deposits:', err);
      setErrorMessage('Error fetching cash deposits');
      setCashDeposits([]);
      setSelectedDepositId(null);
    } finally {
      setIsLoadingDeposits(false);
    }
  };

  const addLoanMutation = useMutation({
    mutationFn: async (loanData: Omit<SubmitLoanData, 'cash_deposit_id'>) => {
      const { error } = await supabase
        .from('employee_loans')
        .insert([{
          ...loanData,
          cash_deposit_id: loanSource === 'cash_deposit' ? selectedDepositId : null
        }]);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', employeeId, currentMonth] });
    }
  });

  const deleteLoanMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_loans')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans', employeeId, currentMonth] });
    }
  });

  return {
    loans,
    errorMessage,
    setErrorMessage,
    loanSource,
    setLoanSource,
    cashDeposits,
    selectedDepositId,
    setSelectedDepositId,
    isLoadingDeposits,
    fetchCashDeposits,
    addLoanMutation,
    deleteLoanMutation
  };
}; 