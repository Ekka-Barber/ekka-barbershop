
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { FileMetadata } from '@/types/admin';

export const useDeleteFileMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: FileMetadata) => {
      console.log('Starting file deletion process:', file);
      
      try {
        console.log('Deleting from storage:', file.file_path);
        const { error: storageError } = await supabase.storage
          .from('marketing_files')
          .remove([file.file_path]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          throw new Error(`Failed to delete file from storage: ${storageError.message}`);
        }

        console.log('Deleting from database:', file.id);
        const { error: dbError } = await supabase
          .from('marketing_files')
          .delete()
          .eq('id', file.id);
        
        if (dbError) {
          console.error('Database deletion error:', dbError);
          console.log('Attempting to rollback storage deletion...');
          throw new Error(`Failed to delete file record: ${dbError.message}`);
        }

        console.log('File deletion completed successfully');
        return { success: true };
      } catch (error) {
        console.error('Deletion process error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  });
};
