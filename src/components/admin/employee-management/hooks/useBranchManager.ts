
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase.from('branches').select('id, name');
      
      if (error) throw error;
      
      console.log('Fetched branches:', data);
      setBranches(data || []);
      
      // Set first branch as default if any branches exist
      if (data && data.length > 0) {
        setSelectedBranch(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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
