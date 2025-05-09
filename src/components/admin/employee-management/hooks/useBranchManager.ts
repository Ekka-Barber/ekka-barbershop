import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Branch } from '@/types/branch'; // Use canonical Branch type

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
  } = useQuery<Branch[], Error>({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error: supabaseError } = await supabase // Renamed error to avoid conflict
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, working_hours, google_place_id') // Select all fields for canonical Branch type
        .order('name');
      
      if (supabaseError) {
        logger.error('Error fetching branches:', supabaseError);
        throw supabaseError; // Throw the actual Supabase error
      }
      
      // logger.info('Fetched branches count:', data?.length || 0);
      return (data || []) as Branch[]; // Data should now conform to canonical Branch[]
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  if (error) {
    logger.error('Error in useBranchManager hook (after query execution):', error);
  }

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading
  };
};
