import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Branch {
  id: string;
  name: string;
}

interface CategoryBranchAssignmentProps {
  categoryId: string;
  categoryName: string;
}

export const CategoryBranchAssignment = ({ categoryId, categoryName }: CategoryBranchAssignmentProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [assignedBranchIds, setAssignedBranchIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranches = async () => {
    try {
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

  const fetchAssignments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('branch_categories')
        .select('branch_id')
        .eq('category_id', categoryId);

      if (error) throw error;
      setAssignedBranchIds(data.map(item => item.branch_id));
    } catch (error) {
      console.error('Error fetching branch assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  const toggleBranchAssignment = async (branchId: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        // Add assignment
        const { error } = await supabase
          .from('branch_categories')
          .insert({
            branch_id: branchId,
            category_id: categoryId,
            branch_name: branches.find(b => b.id === branchId)?.name,
            category_name_en: categoryName
          });

        if (error) throw error;

        // Automatically assign all services under this category to this branch
        const { data: services, error: servicesError } = await supabase
          .from('services')
          .select('id, name_en, name_ar')
          .eq('category_id', categoryId);

        if (servicesError) throw servicesError;

        if (services && services.length > 0) {
          const serviceAssignments = services.map(service => ({
            branch_id: branchId,
            service_id: service.id,
            branch_name: branches.find(b => b.id === branchId)?.name,
            service_name_en: service.name_en,
            service_name_ar: service.name_ar
          }));

          const { error: bulkInsertError } = await supabase
            .from('branch_services')
            .upsert(serviceAssignments, { onConflict: 'branch_id,service_id' });

          if (bulkInsertError) throw bulkInsertError;
        }

        setAssignedBranchIds(prev => [...prev, branchId]);
        toast({
          title: "Category assigned",
          description: `Category and its services have been assigned to ${branches.find(b => b.id === branchId)?.name}`,
        });
      } else {
        // Remove assignment
        const { error } = await supabase
          .from('branch_categories')
          .delete()
          .eq('branch_id', branchId)
          .eq('category_id', categoryId);

        if (error) throw error;

        // Keep service assignments unless explicitly removed
        setAssignedBranchIds(prev => prev.filter(id => id !== branchId));
        toast({
          title: "Category unassigned",
          description: `Category has been unassigned from ${branches.find(b => b.id === branchId)?.name}`,
        });
      }
    } catch (error) {
      console.error('Error toggling branch assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update branch assignment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBranches();
    if (categoryId) {
      fetchAssignments();
    }
  }, [categoryId, fetchAssignments]);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading branch assignments...</div>;
  }

  const assignmentLabel = 
    assignedBranchIds.length === 0 ? 'Not assigned' :
    assignedBranchIds.length === branches.length ? 'All branches' :
    assignedBranchIds.length === 1 ? branches.find(b => b.id === assignedBranchIds[0])?.name :
    'Multiple branches';

  return (
    <div className="space-y-2">
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium mr-2">Branch assignment:</span>
        <Badge variant={assignedBranchIds.length > 0 ? "default" : "outline"}>
          {assignmentLabel}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {branches.map(branch => (
          <div key={branch.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`branch-${branch.id}`} 
              checked={assignedBranchIds.includes(branch.id)}
              onCheckedChange={(checked) => toggleBranchAssignment(branch.id, checked === true)}
            />
            <Label htmlFor={`branch-${branch.id}`} className="text-sm font-normal">
              {branch.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
