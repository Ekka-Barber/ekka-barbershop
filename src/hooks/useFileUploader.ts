
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { optimizeFile } from '@/utils/fileOptimization';

interface UseFileUploaderProps {
  onUploadSuccess?: () => void;
  branches?: Array<{ id: string; name: string }>;
  isAllBranches: boolean;
  selectedBranch: string | null;
  selectedStartDate?: Date;
  selectedStartTime: string;
  selectedEndDate?: Date;
  selectedEndTime: string;
}

export const useFileUploader = ({
  onUploadSuccess,
  branches,
  isAllBranches,
  selectedBranch,
  selectedStartDate,
  selectedStartTime,
  selectedEndDate,
  selectedEndTime,
}: UseFileUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File, category: string }) => {
      setUploading(true);
      try {
        const optimizedFile = await optimizeFile(file);
        
        if (!optimizedFile) {
          throw new Error('File optimization failed');
        }

        const fileExt = optimizedFile.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const originalPath = `original/${fileName}`;
        const { error: originalUploadError } = await supabase.storage
          .from('marketing_files')
          .upload(originalPath, file);
        
        if (originalUploadError) throw originalUploadError;

        const optimizedPath = `optimized/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('marketing_files')
          .upload(optimizedPath, optimizedFile.file);
        
        if (uploadError) throw uploadError;

        const selectedBranchName = !isAllBranches && selectedBranch 
          ? branches?.find(b => b.id === selectedBranch)?.name 
          : null;

        let startDate = null;
        if (selectedStartDate && selectedStartTime) {
          const [hours, minutes] = selectedStartTime.split(':');
          const date = new Date(selectedStartDate);
          date.setHours(parseInt(hours), parseInt(minutes));
          startDate = date.toISOString();
        }

        let endDate = null;
        if (selectedEndDate && selectedEndTime) {
          const [hours, minutes] = selectedEndTime.split(':');
          const date = new Date(selectedEndDate);
          date.setHours(parseInt(hours), parseInt(minutes));
          endDate = date.toISOString();
        }

        const { error: dbError } = await supabase
          .from('marketing_files')
          .insert({
            file_name: file.name,
            file_path: optimizedPath,
            original_path: originalPath,
            file_type: optimizedFile.type,
            category,
            is_active: true,
            branch_name: selectedBranchName,
            start_date: startDate,
            end_date: endDate,
            file_hash: optimizedFile.originalHash
          });

        if (dbError) throw dbError;
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "File uploaded and optimized successfully",
      });
      onUploadSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    }
  });

  return {
    uploading,
    uploadMutation,
  };
};
