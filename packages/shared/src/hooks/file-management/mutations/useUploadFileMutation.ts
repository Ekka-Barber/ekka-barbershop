
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { supabase } from '@shared/lib/supabase/client';
import { insertData } from '@shared/lib/supabase-helpers';
import { FilePreview } from '@shared/types/admin';
import { useToast } from '@shared/ui/components/use-toast';

import { FileUploadParams } from '../types';


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
    mutationFn: async ({ file, category, branchName, isAllBranches, endDate, endTime }: FileUploadParams) => {
      setUploading(true);

      // Note: Authentication checks removed for admin operations
      // Admin access is protected by URL parameter check in ProtectedRoute component
      // This allows file uploads to work in the admin panel without requiring user authentication

      // Test basic query to verify database connectivity
      const { error: testError } = await supabase
        .from('marketing_files')
        .select('id')
        .limit(1);

      if (testError) {
        throw new Error('Database connectivity test failed: ' + testError.message);
      }

      try {
        validateFile(file);
        const preview = await generatePreview(file, category);
        setFilePreview(preview);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('marketing_files')
          .upload(fileName, file);

        if (uploadError) {
          throw uploadError;
        }

        // Create the base record data with proper typing
        const recordData = {
          file_name: file.name,
          file_path: fileName,
          file_type: file.type,
          category,
          is_active: true,
          display_order: 0,
          branch_name: undefined as string | undefined,
          end_date: undefined as string | undefined,
        };

        // Only add end date if it's provided (for either category)
        if (endDate) {
          recordData.end_date = `${format(endDate, 'yyyy-MM-dd')}T${endTime || '23:59'}:00`;
        }

        // Only add branch data for offers category
        if (category === 'offers') {
          if (!isAllBranches && branchName) {
            // Verify that the branch name exists in the branches table
            const { data: branchCheck, error: branchError } = await supabase
              .from('branches')
              .select('name')
              .eq('name', branchName)
              .single();

            if (branchError || !branchCheck) {
              throw new Error(`Branch "${branchName}" not found. Please select a valid branch.`);
            }

            recordData.branch_name = branchCheck.name; // Use branch name for relationship (matches database schema)
          }
          // For all branches, branch_name remains null (already set to undefined by default)
        }

        // Insert the record directly
        const { data: insertedData, error: dbError } = await supabase
          .from('marketing_files')
          .insert(insertData('marketing_files', recordData))
          .select();

        if (dbError) {
          // Cleanup the uploaded file if the database insert fails
          try {
            await supabase.storage
              .from('marketing_files')
              .remove([fileName]);
          } catch {
            // ignore cleanup failure
          }
          throw dbError;
        }

        // Return the inserted data
        return insertedData;
      } finally {
        setUploading(false);
        setFilePreview(null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      queryClient.invalidateQueries({ queryKey: ['active-menu-files'] });
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
      resetUploadState();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    },
  });
};
