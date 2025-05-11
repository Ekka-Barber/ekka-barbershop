
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

// Export Branch type so it can be imported elsewhere
export interface Branch {
  id: string;
  name: string;
  name_ar?: string | null;
  working_hours?: Record<string, string[]> | null;
  is_main?: boolean;
  address?: string | null;
  address_ar?: string | null;
  whatsapp_number?: string | null;
  google_maps_url?: string | null;
  google_place_id?: string | null;
}

/**
 * Hook for managing branch selection
 * @param initialBranchId - Initial selected branch ID
 * @returns Branch management functionality
 */
export const useBranchManager = (initialBranchId: string | null = null) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(initialBranchId);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch branches from API
  const fetchBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('branches')
        .select('id, name, name_ar, working_hours, is_main')
        .order('name');
        
      if (fetchError) throw new Error(fetchError.message);
      
      if (data) {
        setBranches(data as Branch[]);
        
        // If no branch is selected and we have branches, select the main branch or first branch
        if (!selectedBranch && data.length > 0) {
          const mainBranch = data.find(branch => branch.is_main);
          setSelectedBranch(mainBranch ? mainBranch.id : data[0].id);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching branches';
      logger.error('Error fetching branches:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranch]);

  // Initial fetch
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Get a specific branch by ID
  const getBranchById = useCallback((id: string): Branch | undefined => {
    return branches.find(branch => branch.id === id);
  }, [branches]);

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading,
    error,
    fetchBranches,
    getBranchById
  };
};
