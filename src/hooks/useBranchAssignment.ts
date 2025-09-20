import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/services/supabaseService';

interface Branch {
  id: string;
  name: string;
}

interface UseBranchAssignmentOptions {
  categoryId?: string;
  isOpen: boolean;
}

export const useBranchAssignment = ({ categoryId, isOpen }: UseBranchAssignmentOptions) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

  // Fetch all available branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const supabase = await getSupabaseClient();

        const { data, error } = await supabase
          .from('branches')
          .select('id, name')
          .order('is_main', { ascending: false });

        if (error) throw error;
        setBranches(data || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  // Fetch assigned branches when editing
  useEffect(() => {
    if (categoryId && isOpen) {
      const fetchAssignedBranches = async () => {
        try {
          const supabase = await getSupabaseClient();

          const { data, error } = await supabase
            .from('branch_categories')
            .select('branch_id')
            .eq('category_id', categoryId);

          if (error) throw error;
          setSelectedBranchIds(data.map(item => item.branch_id));
        } catch (error) {
          console.error('Error fetching branch assignments:', error);
        }
      };

      fetchAssignedBranches();
    }
  }, [categoryId, isOpen]);

  const handleToggleBranch = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranchIds(prev => [...prev, branchId]);
    } else {
      setSelectedBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

  const resetSelection = () => {
    setSelectedBranchIds([]);
  };

  return {
    branches,
    selectedBranchIds,
    handleToggleBranch,
    resetSelection,
    setSelectedBranchIds
  };
};
