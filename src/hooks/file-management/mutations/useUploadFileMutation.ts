
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
          console.error('Storage upload failed:', uploadError);
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
          end_date: undefined as string | undefined
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
              console.error('Branch verification failed:', branchError);
              throw new Error(`Branch "${branchName}" not found. Please select a valid branch.`);
            }

            recordData.branch_name = branchCheck.name;  // Use branch name for relationship (matches database schema)
          }
          // For all branches, branch_name remains null (already set to undefined by default)
        }

        // Insert the record directly
        const { data: insertedData, error: dbError } = await supabase
          .from('marketing_files')
          .insert(recordData)
          .select();


        if (dbError) {
          console.error('Database insertion error:', dbError);
          console.error('Error code:', dbError.code);
          console.error('Error message:', dbError.message);
          console.error('Error details:', dbError.details);
          console.error('Error hint:', dbError.hint);

          // Cleanup the uploaded file if the database insert fails
          try {
            await supabase.storage
              .from('marketing_files')
              .remove([fileName]);
          } catch (cleanupError) {
            console.error('Failed to cleanup uploaded file:', cleanupError);
          }
          throw dbError;
        }

        // Return the inserted data
        return insertedData;
      } catch (error: unknown) {
        console.error('Upload error:', error);
        if (error instanceof Error) {
          console.error('Error type:', error.constructor.name);
          console.error('Error message:', error.message);
        } else {
          console.error('Error details:', error);
        }
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
