import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { DynamicField } from '@shared/types/business/calculations';

/**
 * Hook for managing loan saving operations
 */
export const useLoanSaving = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSavingEmployee, setIsSavingEmployee] = useState<string | null>(null);

  const saveLoans = async (
    employeeName: string,
    loans: DynamicField[],
    saveLoansCallback: (employeeName: string, loans: DynamicField[]) => void
  ) => {
    setIsSavingEmployee(employeeName);
    try {
      await saveLoansCallback(employeeName, loans);
      await queryClient.invalidateQueries({ queryKey: ['employee_loans'] });
      toast({
        title: 'Success',
        description: 'Loans saved successfully',
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save loans';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setIsSavingEmployee(null);
    }
  };

  return { saveLoans, isSavingEmployee };
};
