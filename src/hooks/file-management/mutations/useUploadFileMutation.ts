
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FilePreview } from '@/types/admin';
import { FileUploadParams } from '../types';
import { format } from 'date-fns';

export const useUploadFileMutation = (
  setUploading: (value: boolean) => void,
  setFilePreview: (value: FilePreview | null) => void,
  resetUploadState: () => void,
  validateFile: (file: File) => void,
  generatePreview: (file: File, category: 'menu' | 'offers') => Promise<FilePreview>
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, category, branchId, branchName, isAllBranches, endDate, endTime }: FileUploadParams) => {
      setUploading(true);
      console.log('Starting file upload:', { fileName: file.name, category, branchId, endDate });
      
      try {
        validateFile(file);
        const preview = await generatePreview(file, category);
        setFilePreview(preview);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log('Uploading to storage:', fileName);
        const { error: uploadError } = await supabase.storage
          .from('marketing_files')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        // Create the base record data with proper typing
        const recordData: {
          file_name: string;
          file_path: string;
          file_type: string;
          category: string;
          is_active: boolean;
          end_date?: string;
          branch_name?: string | null;
          branch_id?: string | null;
        } = {
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          category,
          is_active: true
        };

        // Only add end date if it's provided (for either category)
        if (endDate) {
          recordData.end_date = `${format(endDate, 'yyyy-MM-dd')}T${endTime || '23:59'}:00`;
        }

        // Only add branch data for offers category
        if (category === 'offers') {
          recordData.branch_name = isAllBranches ? null : branchName;
          recordData.branch_id = isAllBranches ? null : branchId;
        }

        console.log('Inserting file metadata into database:', recordData);
        const { error: dbError } = await supabase
          .from('marketing_files')
          .insert(recordData);

        if (dbError) {
          console.error('Database insertion error:', dbError);
          // Cleanup the uploaded file if the database insert fails
          await supabase.storage
            .from('marketing_files')
            .remove([fileName]);
          throw dbError;
        }
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      } finally {
        setUploading(false);
        setFilePreview(null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      resetUploadState();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    }
  });
};
