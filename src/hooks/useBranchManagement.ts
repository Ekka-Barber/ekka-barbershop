import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import { BranchFormData } from '@/types/branch';

interface WorkingHours {
  [day: string]: {
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  };
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  whatsapp_number: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
  working_hours?: WorkingHours;
  created_at: string;
  updated_at: string;
}

export const useBranchManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  // Fetch all branches
  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('is_main', { ascending: false })
        .order('name');
        
      if (error) {
        logger.error('Error fetching branches:', error);
        throw error;
      }
      
      return data as Branch[];
    },
  });

  // Get selected branch
  const selectedBranch = selectedBranchId && branches 
    ? branches.find(branch => branch.id === selectedBranchId) 
    : null;

  // Create branch
  const createBranchMutation = useMutation({
    mutationFn: async (branchData: BranchFormData) => {
      // If this branch is marked as main, update all other branches to not be main
      if (branchData.is_main) {
        await supabase
          .from('branches')
          .update({ is_main: false })
          .neq('id', '00000000-0000-0000-0000-000000000000'); // This ensures all branches are updated
      }
      
      const { data, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()
        .single();
        
      if (error) {
        logger.error('Error creating branch:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Branch created',
        description: 'The branch was successfully created',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create branch: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Update branch
  const updateBranchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BranchFormData> }) => {
      // If this branch is marked as main, update all other branches to not be main
      if (data.is_main) {
        await supabase
          .from('branches')
          .update({ is_main: false })
          .neq('id', id);
      }
      
      const { data: updatedBranch, error } = await supabase
        .from('branches')
        .update(data)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error('Error updating branch:', error);
        throw error;
      }
      
      return updatedBranch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Branch updated',
        description: 'The branch was successfully updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update branch: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete branch
  const deleteBranchMutation = useMutation({
    mutationFn: async (id: string) => {
      // Check if this is the main branch
      const { data: branchData } = await supabase
        .from('branches')
        .select('is_main')
        .eq('id', id)
        .single();
      
      if (branchData && branchData.is_main) {
        throw new Error('Cannot delete the main branch');
      }
      
      // Check if this branch has related data
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('branch_id', id);
        
      if (employeeCount && employeeCount > 0) {
        throw new Error(`Cannot delete branch with ${employeeCount} associated employees`);
      }
      
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
        
      if (error) {
        logger.error('Error deleting branch:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setSelectedBranchId(null);
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast({
        title: 'Branch deleted',
        description: 'The branch was successfully deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete branch',
        variant: 'destructive',
      });
    },
  });

  return {
    branches,
    isLoading,
    selectedBranchId,
    setSelectedBranchId,
    selectedBranch,
    createBranch: createBranchMutation.mutate,
    updateBranch: updateBranchMutation.mutate,
    deleteBranch: deleteBranchMutation.mutate,
    isCreating: createBranchMutation.isPending,
    isUpdating: updateBranchMutation.isPending,
    isDeleting: deleteBranchMutation.isPending,
  };
};
