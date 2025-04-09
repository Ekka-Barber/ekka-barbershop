import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SalaryPlan {
  id: string;
  name: string;
  type: string;
}

interface QuickFixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  currentSalaryPlanId: string | null;
  onSuccess: () => void;
}

export const QuickFixDialog = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  currentSalaryPlanId,
  onSuccess
}: QuickFixDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [salaryPlans, setSalaryPlans] = useState<SalaryPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(currentSalaryPlanId);
  
  // Fetch available salary plans
  useEffect(() => {
    const fetchSalaryPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('salary_plans')
          .select('id, name, type')
          .order('name');
          
        if (error) throw error;
        setSalaryPlans(data || []);
      } catch (err) {
        console.error('Error fetching salary plans:', err);
      }
    };
    
    if (isOpen) {
      fetchSalaryPlans();
      setSelectedPlanId(currentSalaryPlanId);
      setIsSuccess(false);
    }
  }, [isOpen, currentSalaryPlanId]);
  
  // Handle plan selection
  const handlePlanChange = (value: string) => {
    setSelectedPlanId(value);
  };
  
  // Apply the selected plan to the employee
  const handleApply = async () => {
    if (!selectedPlanId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('employees')
        .update({ salary_plan_id: selectedPlanId })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onSuccess();
        onClose();
        resetState();
      }, 1500);
    } catch (err) {
      console.error('Error updating employee salary plan:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset dialog state
  const resetState = () => {
    setIsLoading(false);
    setIsSuccess(false);
  };
  
  // Handle close
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Salary Plan</DialogTitle>
          <DialogDescription>
            Fix the salary calculation for {employeeName} by assigning a valid salary plan.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="font-medium">Salary Plan Updated Successfully!</p>
            <p className="text-sm text-muted-foreground">
              The employee's salary will be recalculated on the next refresh.
            </p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="plan-select" className="text-sm font-medium">
                    Select Salary Plan
                  </label>
                  <Select
                    value={selectedPlanId || ""}
                    onValueChange={handlePlanChange}
                  >
                    <SelectTrigger id="plan-select" className="w-full">
                      <SelectValue placeholder="Select a salary plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {salaryPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} ({plan.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>
                    Current Status: {currentSalaryPlanId ? 
                      <span className="font-medium text-amber-600">Has plan but calculation failed</span> : 
                      <span className="font-medium text-red-600">No salary plan assigned</span>
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={!selectedPlanId || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Apply Salary Plan'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}; 
