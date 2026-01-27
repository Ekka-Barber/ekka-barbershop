import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';

interface DeductionEditingRecord {
  id: string;
  description: string;
  amount: string;
}

export const useDeductionOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingDeduction, setEditingDeduction] =
    useState<DeductionEditingRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!editingDeduction) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('employee_deductions')
        .update({
          description: editingDeduction.description,
          amount: Number(editingDeduction.amount),
        })
        .eq('id', editingDeduction.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deduction updated successfully',
      });

      setEditingDeduction(null);
      await queryClient.invalidateQueries({
        queryKey: ['employee_deductions'],
      });
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

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      const { error } = await supabase
        .from('employee_deductions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Deduction deleted successfully',
      });

      await queryClient.invalidateQueries({
        queryKey: ['employee_deductions'],
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return {
    editingDeduction,
    setEditingDeduction,
    isEditing,
    isDeletingId,
    handleEdit,
    handleDelete,
  };
};
