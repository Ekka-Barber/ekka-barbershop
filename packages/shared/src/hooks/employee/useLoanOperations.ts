import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';

export const useLoanOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const deleteLoan = async (id: string) => {
    setIsDeletingId(id);
    try {
      const { error } = await supabase
        .from('employee_loans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Loan deleted successfully',
      });

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
      setIsDeletingId(null);
    }
  };

  return { deleteLoan, isDeletingId };
};
