import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';

import { LoanEditingRecord, EmployeeLoan } from '../types/loansTypes';
import { createLoanEditingRecord } from '../utils/index';

/**
 * Hook for managing loan editing state and operations
 */
export const useLoanEditing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingLoan, setEditingLoan] = useState<LoanEditingRecord | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const startEditing = (loan: EmployeeLoan) => {
    setEditingLoan(createLoanEditingRecord(loan));
  };

  const cancelEditing = () => {
    setEditingLoan(null);
  };

  const updateEditingLoan = (updates: Partial<LoanEditingRecord>) => {
    if (editingLoan) {
      setEditingLoan({ ...editingLoan, ...updates });
    }
  };

  const saveEdit = async () => {
    if (!editingLoan) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('employee_loans')
        .update({
          description: editingLoan.description,
          amount: Number(editingLoan.amount),
          date: editingLoan.date,
        })
        .eq('id', editingLoan.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Loan updated successfully',
      });

      setEditingLoan(null);
      await queryClient.invalidateQueries({ queryKey: ['employee_loans'] });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsEditing(false);
    }
  };

  return {
    editingLoan,
    isEditing,
    startEditing,
    cancelEditing,
    updateEditingLoan,
    saveEdit,
  };
};
