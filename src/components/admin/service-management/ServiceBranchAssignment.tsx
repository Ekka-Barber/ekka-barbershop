
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

interface Branch {
  id: string;
  name: string;
}

interface ServiceBranchAssignmentProps {
  serviceId: string;
  serviceName: string;
}

export const ServiceBranchAssignment = ({ serviceId, serviceName }: ServiceBranchAssignmentProps) => {
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

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('branch_services')
        .select('branch_id')
        .eq('service_id', serviceId);

      if (error) throw error;
      setAssignedBranchIds(data.map(item => item.branch_id));
    } catch (error) {
      console.error('Error fetching branch assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBranchAssignment = async (branchId: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        // Add assignment
        const { error } = await supabase
          .from('branch_services')
          .insert({
            branch_id: branchId,
            service_id: serviceId,
            branch_name: branches.find(b => b.id === branchId)?.name,
            service_name_en: serviceName
          });

        if (error) throw error;
        setAssignedBranchIds(prev => [...prev, branchId]);
        toast({
          title: "Service assigned",
          description: `Service has been assigned to ${branches.find(b => b.id === branchId)?.name}`,
        });
      } else {
        // Remove assignment
        const { error } = await supabase
          .from('branch_services')
          .delete()
          .eq('branch_id', branchId)
          .eq('service_id', serviceId);

        if (error) throw error;
        setAssignedBranchIds(prev => prev.filter(id => id !== branchId));
        toast({
          title: "Service unassigned",
          description: `Service has been unassigned from ${branches.find(b => b.id === branchId)?.name}`,
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
    if (serviceId) {
      fetchAssignments();
    }
  }, [serviceId]);

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
              id={`service-branch-${branch.id}`} 
              checked={assignedBranchIds.includes(branch.id)}
              onCheckedChange={(checked) => toggleBranchAssignment(branch.id, checked === true)}
            />
            <Label htmlFor={`service-branch-${branch.id}`} className="text-sm font-normal">
              {branch.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
