import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileMetadata } from '@/types/admin';

export const useFileManagement = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("23:59");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const { data, error } = await supabase
        .from('marketing_files')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as FileMetadata[];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }: { file: File, category: string }) => {
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
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
      } finally {
        setUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        description: "File uploaded successfully",
      });
      setSelectedBranch(null);
      setIsAllBranches(true);
      setSelectedDate(undefined);
      setSelectedTime("23:59");
    },
    onError: (error) => {
      toast({
        description: "Failed to upload file",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ is_active: isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        description: "File status updated",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const fileToDelete = files?.find(f => f.id === id);
      if (!fileToDelete) return;

      const { error: storageError } = await supabase.storage
        .from('marketing_files')
        .remove([fileToDelete.file_path]);
      
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('marketing_files')
        .delete()
        .eq('id', id);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        description: "File deleted successfully",
      });
    }
  });

  const updateEndDateMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string, endDate: string | null }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ end_date: endDate })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        description: "End date updated successfully",
      });
    },
    onError: (error) => {
      toast({
        description: "Failed to update end date",
        variant: "destructive",
      });
      console.error('Update error:', error);
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
    branches,
    files,
    isLoading,
    uploadMutation,
    toggleActiveMutation,
    deleteMutation,
    updateEndDateMutation,
  };
};
