import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Branch } from '../types'; // Import Branch type

export const useBranchManager = (initialBranchId: string | null = null) => {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranchId);

  // Update selected branch if initialBranchId changes
  useEffect(() => {
    if (initialBranchId !== null) {
      setSelectedBranch(initialBranchId);
    }
  }, [initialBranchId]);

  const { 
    data: branches = [], 
    isLoading,
    error 
  } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('name');
      
      if (error) {
        logger.error('Error fetching branches:', error);
        throw error;
      }
      
      logger.info('Fetched branches count:', data?.length || 0);
      return (data || []) as Branch[];
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  if (error) {
    logger.error('Error in useBranchManager:', error);
  }

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading
  };
};
