import { useState, useEffect, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getSupabaseClient } from '@/services/supabaseService';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface ServiceBranchAssignmentProps {
  serviceId: string;
  serviceName: string;
  serviceNameAr?: string;
}

export const ServiceBranchAssignment = ({ serviceId, serviceName, serviceNameAr }: ServiceBranchAssignmentProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [assignedBranchIds, setAssignedBranchIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBranchIds, setProcessingBranchIds] = useState<string[]>([]);

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
      toast({
        title: "Error",
        description: "Failed to load branches. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = useCallback(async () => {
    try {
      const supabase = await getSupabaseClient();

      const { data, error } = await supabase
        .from('branch_services')
        .select('branch_id')
        .eq('service_id', serviceId);

      if (error) throw error;
      setAssignedBranchIds(data.map(item => item.branch_id));
    } catch (error) {
      console.error('Error fetching branch assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load branch assignments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  const toggleBranchAssignment = async (branchId: string, isChecked: boolean) => {
    // Add branch to processing state
    setProcessingBranchIds(prev => [...prev, branchId]);

    try {
      const supabase = await getSupabaseClient();

      if (isChecked) {
        // Check if assignment already exists to prevent duplicates
        const { data: existingAssignment } = await supabase
          .from('branch_services')
          .select('*')
          .eq('branch_id', branchId)
          .eq('service_id', serviceId)
          .maybeSingle();

        if (existingAssignment) {
          console.log('Assignment already exists, skipping insert');
          setAssignedBranchIds(prev => [...prev, branchId]);
          return;
        }

        // Add assignment
        const { error } = await supabase
          .from('branch_services')
          .insert({
            branch_id: branchId,
            service_id: serviceId,
            branch_name: branches.find(b => b.id === branchId)?.name,
            service_name_en: serviceName,
            service_name_ar: serviceNameAr || null
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
    } finally {
      // Remove branch from processing state
      setProcessingBranchIds(prev => prev.filter(id => id !== branchId));
    }
  };

  useEffect(() => {
    fetchBranches();
    if (serviceId) {
      fetchAssignments();
    }
  }, [serviceId, fetchAssignments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm text-gray-500">Loading branch assignments...</span>
      </div>
    );
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
        {branches.map(branch => {
          const isProcessing = processingBranchIds.includes(branch.id);
          return (
            <div key={branch.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-branch-${branch.id}`} 
                checked={assignedBranchIds.includes(branch.id)}
                onCheckedChange={(checked) => toggleBranchAssignment(branch.id, checked === true)}
                disabled={isProcessing}
              />
              <Label htmlFor={`service-branch-${branch.id}`} className="text-sm font-normal flex items-center">
                {branch.name}
                {isProcessing && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
