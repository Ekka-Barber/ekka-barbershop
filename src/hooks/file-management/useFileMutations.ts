
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileMetadata, FilePreview } from '@/types/admin';
import { FileUploadParams, FileToggleParams, FileEndDateParams } from './types';
import { useFileValidation } from './useFileValidation';
import { format } from 'date-fns';

export const useFileMutations = (
  setUploading: (value: boolean) => void,
  setFilePreview: (value: FilePreview | null) => void,
  resetUploadState: () => void
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { validateFile, generatePreview } = useFileValidation();

  const uploadMutation = useMutation({
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

        // Create the base record data
        const recordData: {
          file_name: string;
          file_path: string;
          file_type: string;
          category: string;
          is_active: boolean;
          end_date?: Date;
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
          recordData.end_date = new Date(`${format(endDate, 'yyyy-MM-dd')}T${endTime || '23:59'}:00`);
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

  const deleteMutation = useMutation({
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

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: FileToggleParams) => {
      console.log('Toggling file status:', { id, isActive });
      const { error } = await supabase
        .from('marketing_files')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
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

  const updateEndDateMutation = useMutation({
    mutationFn: async ({ id, endDate }: FileEndDateParams) => {
      console.log('Updating end date:', { id, endDate });
      const { error } = await supabase
        .from('marketing_files')
        .update({ end_date: endDate })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
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

  return {
    uploadMutation,
    deleteMutation,
    toggleActiveMutation,
    updateEndDateMutation
  };
};
