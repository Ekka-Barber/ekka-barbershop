
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileMetadata } from '@/types/admin';

export const useDeleteFileMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: FileMetadata) => {
      try {
        const { error: storageError } = await supabase.storage
          .from('marketing_files')
          .remove([file.file_path]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          throw new Error(`Failed to delete file from storage: ${storageError.message}`);
        }

        const { error: dbError } = await supabase
          .from('marketing_files')
          .delete()
          .eq('id', file.id);
        
        if (dbError) {
          console.error('Database deletion error:', dbError);
          throw new Error(`Failed to delete file record: ${dbError.message}`);
        }

        // Return void to match expected type
        return;
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
