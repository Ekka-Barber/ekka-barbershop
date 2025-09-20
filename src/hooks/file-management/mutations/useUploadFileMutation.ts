
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

      // Check Supabase client configuration (removed protected property access)
      console.log('Supabase client config check initiated');

      // Check authentication status
      const { data: user, error: authError } = await supabase.auth.getUser();
      console.log('Authentication status:', { user: user?.user?.id, error: authError });

      // Check session
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Session status:', {
        hasSession: !!session?.session,
        hasAccessToken: !!session?.session?.access_token,
        error: sessionError
      });

      // Test basic query to verify database connectivity
      console.log('Testing database connectivity...');
      const { data: testQuery, error: testError } = await supabase
        .from('marketing_files')
        .select('id')
        .limit(1);

      console.log('Database connectivity test:', {
        data: testQuery,
        error: testError,
        success: !testError
      });

      if (authError) {
        console.error('Authentication error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }

      if (!session.session?.access_token) {
        console.error('No valid session found');
        throw new Error('No valid session. Please refresh the page and try again.');
      }

      if (testError) {
        console.error('Database connectivity failed:', testError);
        throw new Error('Database connectivity test failed: ' + testError.message);
      }

      try {
        validateFile(file);
        const preview = await generatePreview(file, category);
        setFilePreview(preview);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log('Uploading to storage:', fileName);
        const { data: authUser, error: authCheck } = await supabase.auth.getUser();
        console.log('Supabase auth status:', { user: authUser?.user?.id, error: authCheck });

        // Check if storage bucket exists and is accessible
        console.log('Checking storage bucket...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets?.map(b => b.name));
        console.log('Buckets error:', bucketsError);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('marketing_files')
          .upload(fileName, file);

        console.log('Storage upload result:', uploadData);
        console.log('Storage upload error:', uploadError);

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
            console.log('Verifying branch exists:', branchName);
            const { data: branchCheck, error: branchError } = await supabase
              .from('branches')
              .select('name')
              .eq('name', branchName)
              .single();

            if (branchError || !branchCheck) {
              console.error('Branch verification failed:', branchError);
              throw new Error(`Branch "${branchName}" not found. Please select a valid branch.`);
            }

            console.log('Branch verified successfully:', branchCheck);

            recordData.branch_name = branchCheck.name;  // Use branch name for relationship (matches database schema)
          }
          // For all branches, branch_name remains null (already set to undefined by default)
        }

        console.log('Inserting file metadata into database:', recordData);
        console.log('Record data keys:', Object.keys(recordData));
        console.log('Record data values:', Object.values(recordData));

        // Test a minimal insert first
        console.log('Testing minimal insert...');
        const minimalRecord = {
          file_name: 'test.jpg',
          file_path: 'test.jpg',
          file_type: 'image/jpeg',
          category: 'menu' as const,
          is_active: true
        };

        console.log('Minimal record to insert:', minimalRecord);

        try {
          const { data: minimalResult, error: minimalError } = await supabase
            .from('marketing_files')
            .insert(minimalRecord)
            .select();

          console.log('Minimal insert result:', minimalResult);
          console.log('Minimal insert error:', minimalError);

          if (minimalError) {
            console.error('Minimal insert failed, this indicates a fundamental issue');
            throw minimalError;
          }

          console.log('Minimal insert succeeded, proceeding with full insert');

          // If minimal insert worked, try the full record
          const { data: insertResult, error: dbError } = await supabase
            .from('marketing_files')
            .insert(recordData)
            .select();

          console.log('Insert result:', insertResult);

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
        } catch (error: unknown) {
          console.error('Unexpected error during database insertion:', error);
          if (error instanceof Error) {
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
          } else {
            console.error('Error details:', error);
          }
          throw error;
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
