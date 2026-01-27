import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';
import type { DynamicField } from '@shared/types/business';

import type { BonusEditingRecord } from './types';

interface UseBonusesOperationsProps {
  editingBonus: BonusEditingRecord | null;
  setEditingBonus: (bonus: BonusEditingRecord | null) => void;
}

export const useBonusesOperations = ({
  editingBonus,
  setEditingBonus,
}: UseBonusesOperationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSavingEmployee, setIsSavingEmployee] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!editingBonus) return;

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('employee_bonuses')
        .update({
          description: editingBonus.description,
          amount: Number(editingBonus.amount),
          date: editingBonus.date,
        })
        .eq('id', editingBonus.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bonus updated successfully',
      });

      setEditingBonus(null);
      await queryClient.invalidateQueries({ queryKey: ['employee_bonuses'] });
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
        .from('employee_bonuses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bonus deleted successfully',
      });

      await queryClient.invalidateQueries({ queryKey: ['employee_bonuses'] });
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

  const handleSaveBonuses = async (
    employeeName: string,
    bonuses: DynamicField[],
    saveBonuses: (employeeName: string, bonuses: DynamicField[]) => void
  ) => {
    setIsSavingEmployee(employeeName);
    try {
      await saveBonuses(employeeName, bonuses);
      toast({
        title: 'Success',
        description: 'Bonuses saved successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save bonuses';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSavingEmployee(null);
    }
  };

  return {
    isEditing,
    isDeletingId,
    isSavingEmployee,
    handleEdit,
    handleDelete,
    handleSaveBonuses,
  };
};
