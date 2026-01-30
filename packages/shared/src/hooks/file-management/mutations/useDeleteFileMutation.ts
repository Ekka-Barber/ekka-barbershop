
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';
import { FileMetadata } from '@shared/types/admin';
import { useToast } from '@shared/ui/components/use-toast';

export const useDeleteFileMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: FileMetadata) => {
      const { error: storageError } = await supabase.storage
        .from('marketing_files')
        .remove([file.file_path]);

      if (storageError) {
        throw new Error(`Failed to delete file from storage: ${storageError.message}`);
      }

      const { error: dbError } = await supabase
        .from('marketing_files')
        .delete()
        .eq('id', file.id);

      if (dbError) {
        throw new Error(`Failed to delete file record: ${dbError.message}`);
      }

      // Return void to match expected type
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file',
        variant: 'destructive',
      });
    },
  });
};
