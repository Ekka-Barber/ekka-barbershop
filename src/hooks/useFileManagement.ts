
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { FileMetadata } from '@/types/admin';
import { useFileUploader } from './useFileUploader';

export const useFileManagement = () => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState<string>("00:00");
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>("23:59");
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

  const { uploading, uploadMutation } = useFileUploader({
    branches,
    isAllBranches,
    selectedBranch,
    selectedStartDate,
    selectedStartTime,
    selectedEndDate,
    selectedEndTime,
    onUploadSuccess: () => {
      setSelectedBranch(null);
      setIsAllBranches(true);
      setSelectedStartDate(undefined);
      setSelectedStartTime("00:00");
      setSelectedEndDate(undefined);
      setSelectedEndTime("23:59");
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
        title: "Success",
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
        title: "Success",
        description: "File deleted successfully",
      });
    }
  });

  const updateDatesMutation = useMutation({
    mutationFn: async ({ 
      id, 
      startDate, 
      endDate 
    }: { 
      id: string, 
      startDate: string | null,
      endDate: string | null 
    }) => {
      const { error } = await supabase
        .from('marketing_files')
        .update({ 
          start_date: startDate,
          end_date: endDate 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-files'] });
      toast({
        title: "Success",
        description: "Dates updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update dates",
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
    selectedStartDate,
    setSelectedStartDate,
    selectedStartTime,
    setSelectedStartTime,
    selectedEndDate,
    setSelectedEndDate,
    selectedEndTime,
    setSelectedEndTime,
    branches,
    files,
    isLoading,
    uploadMutation,
    toggleActiveMutation,
    deleteMutation,
    updateDatesMutation,
  };
};
