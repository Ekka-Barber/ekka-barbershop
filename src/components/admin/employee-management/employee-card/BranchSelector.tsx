
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, LoaderCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Branch {
  id: string;
  name: string;
}

interface BranchSelectorProps {
  employeeId: string;
  employeeName: string;
  initialBranchId: string | null;
  branches: Branch[];
  refetchEmployees?: () => void;
}

export const BranchSelector = ({ 
  employeeId, 
  employeeName, 
  initialBranchId, 
  branches,
  refetchEmployees 
}: BranchSelectorProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(initialBranchId);

  const updateEmployeeBranch = async () => {
    if (!selectedBranchId || selectedBranchId === initialBranchId) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('employees')
        .update({ branch_id: selectedBranchId })
        .eq('id', employeeId);

      if (error) throw error;

      toast({
        title: "Branch updated",
        description: `${employeeName} has been assigned to a new branch.`,
      });

      if (refetchEmployees) {
        refetchEmployees();
      }
    } catch (error) {
      console.error('Error updating employee branch:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the employee's branch.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <Label htmlFor={`branch-${employeeId}`} className="text-sm font-medium mb-1.5 block flex items-center gap-1">
        <Building className="h-4 w-4" />
        Assigned Branch
      </Label>
      <Select
        value={selectedBranchId || ""}
        onValueChange={setSelectedBranchId}
      >
        <SelectTrigger id={`branch-${employeeId}`} className="w-full">
          <SelectValue placeholder="Select branch" />
        </SelectTrigger>
        <SelectContent>
          {branches.map(branch => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedBranchId !== initialBranchId && (
        <div className="mt-2">
          <Button 
            size="sm" 
            className="w-full"
            onClick={updateEmployeeBranch}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : "Update Branch"}
          </Button>
        </div>
      )}
    </div>
  );
};
