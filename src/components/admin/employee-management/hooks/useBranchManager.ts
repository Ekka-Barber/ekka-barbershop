
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface Branch {
  id: string;
  name: string;
}

export const useBranchManager = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      // Explicitly select only the fields we need
      const { data, error } = await supabase.from('branches').select('id, name');
      
      if (error) throw error;
      
      logger.info('Fetched branches count:', data?.length || 0);
      setBranches(data || []);
      
      // Don't automatically select the first branch
      // Let the user choose to see all employees or filter by branch
    } catch (error) {
      logger.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    branches,
    selectedBranch,
    setSelectedBranch,
    isLoading,
    setIsLoading
  };
};
