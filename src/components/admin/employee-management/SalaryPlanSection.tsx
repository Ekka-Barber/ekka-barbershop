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

interface SalaryPlanSectionProps {
  employee: Employee;
  salesAmount: number;
  refetchEmployees?: () => void;
}

export const SalaryPlanSection = ({ 
  employee, 
  salesAmount,
  refetchEmployees 
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

  // Fetch current salary plan details
  const { data: currentPlan, isLoading: isPlanLoading } = useQuery({
    queryKey: ['employee-salary-plan', employee.salary_plan_id],
    queryFn: async () => {
      if (!employee.salary_plan_id) return null;
      
      const { data, error } = await supabase
        .from('salary_plans')
        .select('*')
        .eq('id', employee.salary_plan_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!employee.salary_plan_id
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
  const parseConfig = (config) => {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch (error) {
        console.error('Error parsing config string:', error);
        return {};
      }
    }
    
    return config;
  };

  // Calculate compensation based on the correct plan structure
  const calculateCompensation = (plan, sales) => {
    if (!plan) return { 
      baseSalary: 0, 
      commission: 0, 
      bonus: 0, 
      total: 0,
      details: [] 
    };
    
    let baseSalary = 0;
    let commission = 0;
    let bonus = 0;
    const details = [];
    
    try {
      const parsedConfig = parseConfig(plan.config);
      
      // If there are no blocks, return zeros
      if (!parsedConfig.blocks || !Array.isArray(parsedConfig.blocks)) {
        return { 
          baseSalary: 0, 
          commission: 0, 
          bonus: 0, 
          total: 0,
          details: [] 
        };
      }
      
      // Process each block in the salary plan
      parsedConfig.blocks.forEach(block => {
        if (block.type === 'basic_salary' && block.config) {
          baseSalary = block.config.base_salary || 0;
          details.push({
            type: 'Base Salary',
            amount: baseSalary,
            description: 'Fixed base salary'
          });
          
          // Calculate tiered bonus if available
          if (block.config.tiered_bonus && Array.isArray(block.config.tiered_bonus)) {
            // Sort tiers by sales target (ascending)
            const sortedTiers = [...block.config.tiered_bonus].sort((a, b) => 
              a.sales_target - b.sales_target
            );
            
            // Find the highest tier that was reached
            let applicableTier = null;
            for (const tier of sortedTiers) {
              if (sales >= tier.sales_target) {
                applicableTier = tier;
              } else {
                break;
              }
            }
            
            if (applicableTier) {
              bonus = applicableTier.bonus;
              details.push({
                type: 'Performance Bonus',
                amount: bonus,
                description: `For reaching ${applicableTier.sales_target.toLocaleString()} SAR sales target`
              });
            }
          }
        }
        
        if (block.type === 'commission' && block.config) {
          const threshold = block.config.threshold || 0;
          const rate = block.config.rate || 0;
          
          if (sales > threshold) {
            const commissionableAmount = sales - threshold;
            commission = commissionableAmount * rate;
            details.push({
              type: 'Commission',
              amount: Math.round(commission),
              description: `${(rate * 100).toFixed(1)}% on sales above ${threshold.toLocaleString()} SAR`
            });
          }
        }
      });
    } catch (error) {
      console.error('Error calculating compensation:', error);
    }
    
    return {
      baseSalary: Math.round(baseSalary),
      commission: Math.round(commission),
      bonus: Math.round(bonus),
      total: Math.round(baseSalary + commission + bonus),
      details
    };
  };

  const compensation = calculateCompensation(currentPlan, salesAmount);
  const isLoading = isPlansLoading || isPlanLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Debug logs to help identify the issue
  console.log('Current plan:', currentPlan);
  console.log('Sales amount:', salesAmount);
  console.log('Calculated compensation:', compensation);

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
            {salaryPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {parseConfig(plan.config).name || 'Unnamed Plan'}
              </SelectItem>
            ))}
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
      
      {currentPlan && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Compensation Details
              </h3>
              <p className="text-xs text-muted-foreground">
                Plan: {parseConfig(currentPlan.config).name || 'Unnamed Plan'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <p className="text-xs text-muted-foreground">Base Salary</p>
                <p className="font-semibold">{compensation.baseSalary.toLocaleString()} SAR</p>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-semibold">{compensation.commission.toLocaleString()} SAR</p>
              </div>
              {compensation.bonus > 0 && (
                <div className="text-center p-2 bg-muted/20 rounded-md">
                  <p className="text-xs text-muted-foreground">Bonus</p>
                  <p className="font-semibold">{compensation.bonus.toLocaleString()} SAR</p>
                </div>
              )}
              <div className="text-center p-2 bg-primary/10 rounded-md col-span-full">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">{compensation.total.toLocaleString()} SAR</p>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-2">
              <p>Based on {salesAmount.toLocaleString()} SAR in sales</p>
            </div>
            
            {compensation.details.length > 0 && (
              <div className="mt-2 space-y-2">
                <h4 className="text-xs font-medium">Compensation Breakdown</h4>
                <div className="space-y-1">
                  {compensation.details.map((detail, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{detail.type}</span>
                      <div className="flex items-center gap-1">
                        {detail.type === 'Performance Bonus' && (
                          <ChevronUp className="h-3 w-3 text-green-500" />
                        )}
                        <span>{detail.amount.toLocaleString()} SAR</span>
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
