import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { LoaderCircle, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalaryCalculation } from '@/lib/salary/hooks/useSalaryCalculation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatPrice } from "@/utils/formatters";

// Helper function to get current month in YYYY-MM format
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

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
  const [isCompensationVisible, setIsCompensationVisible] = useState(false);

  // Get the current month for salary calculation
  const selectedMonth = getCurrentMonth();

  // Fetch available salary plans
  const { data: salaryPlans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['salary-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name') // Only select needed fields
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Use the centralized salary calculation hook
  const {
    baseSalary,
    commission,
    targetBonus, // Note: targetBonus from hook might differ from local 'bonus'
    deductions,
    loans,
    totalSalary,
    planName,
    details: salaryDetails,
    isLoading: isSalaryCalculating,
    error: salaryError,
    calculationDone
  } = useSalaryCalculation({
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

  // Combined loading state
  const isLoading = isPlansLoading || isSalaryCalculating;

  if (isLoading && !calculationDone) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Handle salary calculation error
  if (salaryError) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
        Error calculating salary: {salaryError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                {plan.name || 'Unnamed Plan'} {/* Use plan.name directly */}
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

      {/* Salary Compensation Details - Accordion */}
      <Accordion 
        type="single" 
        collapsible 
        className="w-full" 
        value={isCompensationVisible ? "item-1" : ""}
        onValueChange={(value) => setIsCompensationVisible(value === "item-1")}
      >
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline p-3 bg-gray-50 rounded-t-md">
            <div className='flex items-center space-x-2'>
              <DollarSign className="h-5 w-5 text-gray-600" />
              <span>Salary & Compensation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 border border-t-0 rounded-b-md">
            {isSalaryCalculating && !calculationDone ? (
              <div className="flex justify-center items-center h-20">
                <LoaderCircle className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-2">
                  Plan: {planName || 'N/A'}
                </div>
                
                {/* Positive components - Base salary, commission, bonus */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-2 rounded-md">
                    <p className="text-xs text-gray-500">Base Salary</p>
                    <p className="text-lg font-semibold">{formatPrice(baseSalary)}</p>
                  </div>
                  
                  <div className={`${commission > 0 ? 'bg-blue-50' : 'bg-gray-50'} p-2 rounded-md`}>
                    <p className="text-xs text-gray-500">Commission</p>
                    <p className="text-lg font-semibold">{formatPrice(commission)}</p>
                  </div>
                  
                  {targetBonus > 0 && (
                    <div className="bg-green-50 p-2 rounded-md">
                      <p className="text-xs text-gray-500">Target Bonus</p>
                      <p className="text-lg font-semibold text-green-700">{formatPrice(targetBonus)}</p>
                    </div>
                  )}
                </div>
                
                {/* Negative components - Deductions and loans with clear visual distinction */}
                {(deductions > 0 || loans > 0) && (
                  <div className="mt-3">
                    <h4 className="text-sm text-gray-600 mb-2">Subtractions:</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      {deductions > 0 && (
                        <div className="bg-red-50 p-2 rounded-md">
                          <p className="text-xs text-red-500">Deductions</p>
                          <p className="text-lg font-semibold text-red-600">-{formatPrice(deductions)}</p>
                        </div>
                      )}
                      
                      {loans > 0 && (
                        <div className="bg-red-50 p-2 rounded-md">
                          <p className="text-xs text-red-500">Loans</p>
                          <p className="text-lg font-semibold text-red-600">-{formatPrice(loans)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grand total - This stands out clearly */}
                <div className="mt-4 p-3 bg-blue-100 rounded-md text-center">
                  <p className="text-xs text-blue-700">Total Salary</p>
                  <p className="text-xl font-bold text-blue-800">{formatPrice(totalSalary)}</p>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Based on {formatPrice(salesAmount)} SAR in sales for {selectedMonth}
                </p>
                
                {/* Detailed breakdown with all components */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Compensation Breakdown:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base Salary</span>
                      <span className="font-medium">{formatPrice(baseSalary)}</span>
                    </div>
                    
                    {commission > 0 && (
                      <div className="flex justify-between">
                        <span>Commission</span>
                        <span className="font-medium">{formatPrice(commission)}</span>
                      </div>
                    )}
                    
                    {targetBonus > 0 && (
                      <div className="flex justify-between">
                        <span>Target Bonus</span>
                        <span className="font-medium text-green-600">{formatPrice(targetBonus)}</span>
                      </div>
                    )}
                    
                    {/* Show deductions and loans even if they're zero */}
                    <div className="flex justify-between">
                      <span>Deductions</span>
                      <span className={deductions > 0 ? "font-medium text-red-600" : "font-medium"}>
                        {deductions > 0 ? `-${formatPrice(deductions)}` : formatPrice(0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Loans</span>
                      <span className={loans > 0 ? "font-medium text-red-600" : "font-medium"}>
                        {loans > 0 ? `-${formatPrice(loans)}` : formatPrice(0)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(totalSalary)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Individual salary component details if available */}
                {salaryDetails && salaryDetails.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Calculation Details:</h4>
                    <ul className="space-y-1 text-xs list-disc list-inside text-gray-600">
                      {salaryDetails.map((detail, index) => (
                        <li key={index}>
                          {detail.description}: {formatPrice(detail.amount)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}; 
