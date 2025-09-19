
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { FileMetadata, FilePreview } from '@/types/admin';
import { useFileMutations } from './file-management/useFileMutations';

export const useFileManagement = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("23:59");
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);

  const resetUploadState = () => {
    setSelectedBranch(null);
    setIsAllBranches(true);
    setSelectedDate(undefined);
    setSelectedTime("23:59");
  };

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
        .select(`
          *,
          branch:branch_id (
            id,
            name,
            name_ar
          )
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FileMetadata[];
    }
  });

  const mutations = useFileMutations(setUploading, setFilePreview, resetUploadState);

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
    ...mutations
  };
};
