import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from "@shared/lib/supabase/client";
import { updateData } from '@shared/lib/supabase-helpers';
import { useToast } from "@shared/ui/components/use-toast";

import { FileEndDateParams } from '../types';

export const useUpdateEndDateMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, endDate, endTime }: FileEndDateParams) => {
      // Create a full timestamp if both date and time are provided
      const endDateTime = endDate && endTime 
        ? `${endDate}T${endTime}:00` 
        : endDate 
        ? `${endDate}T23:59:00`
        : null;
      
      const { error } = await supabase
        .from('marketing_files')
        .update(updateData('marketing_files', { 
          end_date: endDateTime
        }))
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: "Success",
        description: "End date updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update end date",
        variant: "destructive",
      });
    }
  });
};
