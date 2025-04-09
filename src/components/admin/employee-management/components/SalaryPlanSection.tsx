
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle, DollarSign, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalaryCalculation } from '@/lib/salary/hooks/useSalaryCalculation';

// Helper function to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Helper function to safely format numbers with toLocaleString
function safeToLocaleString(value: number | undefined | null): string {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString();
}

interface SalaryPlanSectionProps {
  employee: Employee;
  salesAmount: number;
  refetchEmployees?: () => void;
  selectedMonth?: string; // Format: YYYY-MM
}

export const SalaryPlanSection = ({ 
  employee, 
  salesAmount,
  refetchEmployees, 
  selectedMonth = getCurrentMonth() // Default to current month if not provided
}: SalaryPlanSectionProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(employee.salary_plan_id || null);

  // Fetch available salary plans
  const { data: salaryPlans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Use the new salary calculation hook with selected month
  const salaryCalculation = useSalaryCalculation({
    employee,
    salesAmount,
    selectedMonth
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

  // Parse config safely
  const parseConfig = (config: unknown) => {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch (error) {
        console.error('Error parsing config string:', error);
        return {};
      }
    }
    
    if (typeof config === 'object') {
      return config as Record<string, unknown>;
    }
    
    return {};
  };

  const isLoading = isPlansLoading || salaryCalculation.isLoading;
  
  // Calculate total bonuses for display
  const totalBonuses = (salaryCalculation.targetBonus || 0) + (salaryCalculation.regularBonus || 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Select
          value={selectedPlanId || ""}
          onValueChange={setSelectedPlanId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select salary plan" />
          </SelectTrigger>
          <SelectContent>
            {salaryPlans.map((plan) => {
              const planConfig = parseConfig(plan.config);
              return (
                <SelectItem key={plan.id} value={plan.id}>
                  {(planConfig as { name?: string })?.name || 'Unnamed Plan'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        {selectedPlanId !== employee.salary_plan_id && (
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
      
      {employee.salary_plan_id && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Compensation Details
              </h3>
              <p className="text-xs text-muted-foreground">
                Plan: {salaryCalculation.planName || 'Unnamed Plan'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <p className="text-xs text-muted-foreground">Base Salary</p>
                <p className="font-semibold">{safeToLocaleString(salaryCalculation.baseSalary)} SAR</p>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-semibold">{safeToLocaleString(salaryCalculation.commission)} SAR</p>
              </div>
              
              {/* Display target bonus from plan if available */}
              {(salaryCalculation.targetBonus ?? 0) > 0 && (
                <div className="text-center p-2 bg-green-50 rounded-md">
                  <p className="text-xs text-muted-foreground">Target Bonus</p>
                  <p className="font-semibold text-green-600">{safeToLocaleString(salaryCalculation.targetBonus)} SAR</p>
                </div>
              )}
              
              {/* Display regular bonuses from transactions if available */}
              {(salaryCalculation.regularBonus ?? 0) > 0 && (
                <div className="text-center p-2 bg-green-50 rounded-md">
                  <p className="text-xs text-muted-foreground">Additional Bonuses</p>
                  <p className="font-semibold text-green-600">{safeToLocaleString(salaryCalculation.regularBonus)} SAR</p>
                </div>
              )}
              
              {(salaryCalculation.deductions ?? 0) > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-xs text-muted-foreground">Deductions</p>
                  <p className="font-semibold text-red-500">-{safeToLocaleString(salaryCalculation.deductions)} SAR</p>
                </div>
              )}
              {(salaryCalculation.loans ?? 0) > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-xs text-muted-foreground">Loans</p>
                  <p className="font-semibold text-red-500">-{safeToLocaleString(salaryCalculation.loans)} SAR</p>
                </div>
              )}
              <div className="text-center p-2 bg-primary/10 rounded-md col-span-full">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">{safeToLocaleString(salaryCalculation.totalSalary)} SAR</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              <p>Based on {safeToLocaleString(salesAmount)} SAR in sales</p>
            </div>
            
            {salaryCalculation.details && salaryCalculation.details.length > 0 && (
              <div className="mt-2 space-y-2">
                <h4 className="text-xs font-medium">Compensation Breakdown</h4>
                <div className="space-y-1">
                  {salaryCalculation.details.map((detail, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{detail.type}</span>
                      <div className="flex items-center gap-1">
                        {(['Target Bonus', 'Additional Bonuses', 'Performance Bonus'].includes(detail.type)) && (
                          <ChevronUp className="h-3 w-3 text-green-500" />
                        )}
                        <span>{safeToLocaleString(detail.amount)} SAR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
