
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileMetadata, FilePreview } from '@/types/admin';

export const useFileManagement = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("23:59");
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Maximum file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: files, isLoading } = useQuery({
    queryKey: ['marketing-files'],
    queryFn: async () => {
      console.log('Fetching marketing files...');
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as FileMetadata[];
    }
  });

  const validateFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
    }
  };

  const generatePreview = async (file: File, category: 'menu' | 'offers'): Promise<FilePreview> => {
    if (file.type.startsWith('image/')) {
      return {
        url: URL.createObjectURL(file),
        type: category,
        fileType: 'image'
      };
    } else if (file.type === 'application/pdf') {
      return {
        url: URL.createObjectURL(file),
        type: category,
        fileType: 'pdf'
      };
    }
    throw new Error('Unsupported file type for preview');
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File, category: 'menu' | 'offers' }) => {
      setUploading(true);
      console.log('Starting file upload:', { fileName: file.name, category });
      
      try {
        // Validate file
        validateFile(file);

        // Generate preview
        const preview = await generatePreview(file, category);
        setFilePreview(preview);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log('Uploading to storage:', fileName);
        const { error: uploadError, data } = await supabase.storage
          .from('marketing_files')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const selectedBranchName = !isAllBranches && selectedBranch 
          ? branches?.find(b => b.id === selectedBranch)?.name 
          : null;

        let endDate = null;
        if (selectedDate && selectedTime) {
          const [hours, minutes] = selectedTime.split(':');
          const date = new Date(selectedDate);
          date.setHours(parseInt(hours), parseInt(minutes));
          endDate = date.toISOString();
        }

        console.log('Inserting file metadata into database');
        const { error: dbError } = await supabase
          .from('marketing_files')
          .insert({
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            category,
            is_active: true,
            branch_name: selectedBranchName,
            end_date: endDate
          });

        if (dbError) throw dbError;
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
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setSelectedBranch(null);
      setIsAllBranches(true);
      setSelectedDate(undefined);
      setSelectedTime("23:59");
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
      console.log('Starting file deletion:', file);
      
      try {
        // First try to delete from storage
        console.log('Deleting from storage:', file.file_path);
        const { error: storageError } = await supabase.storage
          .from('marketing_files')
          .remove([file.file_path]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
          throw storageError;
        }

        // Then delete from database
        console.log('Deleting from database:', file.id);
        const { error: dbError } = await supabase
          .from('marketing_files')
          .delete()
          .eq('id', file.id);
        
        if (dbError) throw dbError;

        return { success: true };
      } catch (error) {
        console.error('Deletion error:', error);
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
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
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
    mutationFn: async ({ id, endDate }: { id: string, endDate: string | null }) => {
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
    uploading,
    selectedBranch,
    setSelectedBranch,
    isAllBranches,
    setIsAllBranches,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    filePreview,
    branches,
    files,
    isLoading,
    uploadMutation,
    toggleActiveMutation,
    deleteMutation,
    updateEndDateMutation,
  };
};
