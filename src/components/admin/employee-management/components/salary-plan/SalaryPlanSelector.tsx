
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle } from 'lucide-react';

interface SalaryPlanSelectorProps {
  employee: Employee;
  selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;
  refetchEmployees?: () => void;
}

export const SalaryPlanSelector = ({
  employee,
  selectedPlanId,
  setSelectedPlanId,
  refetchEmployees
}: SalaryPlanSelectorProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch available salary plans
  const { data: salaryPlans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateSalaryPlan = async () => {
    if (!selectedPlanId || selectedPlanId === employee.salary_plan_id) return;

    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('employees')
        .update({ salary_plan_id: selectedPlanId })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: "Salary plan updated",
        description: `${employee.name}'s salary plan has been updated.`,
      });

      // Refetch employees list if provided
      if (refetchEmployees) {
        refetchEmployees();
      }
    } catch (error) {
      console.error('Error updating salary plan:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the employee's salary plan.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <Select
        value={selectedPlanId || ""}
        onValueChange={setSelectedPlanId}
        disabled={isPlansLoading || isUpdating}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select salary plan" />
        </SelectTrigger>
        <SelectContent>
          {salaryPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              {plan.name || 'Unnamed Plan'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPlanId && selectedPlanId !== employee.salary_plan_id && (
        <div className="mt-2">
          <Button 
            size="sm" 
            className="w-full"
            onClick={updateSalaryPlan}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : "Update Salary Plan"}
          </Button>
        </div>
      )}
    </div>
  );
};
