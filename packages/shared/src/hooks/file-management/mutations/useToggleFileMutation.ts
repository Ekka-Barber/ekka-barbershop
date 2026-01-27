
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from "@shared/lib/supabase/client";
import { updateData } from '@shared/lib/supabase-helpers';
import { useToast } from "@shared/ui/components/use-toast";

import { FileToggleParams } from '../types';

export const useToggleFileMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: FileToggleParams) => {
      const { error } = await supabase
        .from('marketing_files')
        .update(updateData('marketing_files', { is_active: isActive }))
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: "Success",
        description: "File status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update file status",
        variant: "destructive",
      });
    }
  });
};
