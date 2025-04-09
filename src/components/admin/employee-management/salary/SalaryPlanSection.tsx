
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalaryCalculation } from '@/lib/salary/hooks/useSalaryCalculation';
import { SalaryPlanSelector } from './components/SalaryPlanSelector';
import { CompensationDetails } from './components/CompensationDetails';
import { getCurrentMonth } from './helpers/dateUtils';

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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(employee.salary_plan_id || null);
  const [isCompensationVisible, setIsCompensationVisible] = useState(false);

  // Get the current month for salary calculation
  const selectedMonth = getCurrentMonth();

  // Use the centralized salary calculation hook
  const calculationResult = useSalaryCalculation({
    employee,
    salesAmount,
    selectedMonth
  });

  // Combined loading state
  const isLoading = calculationResult.isLoading && !calculationResult.calculationDone;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Handle salary calculation error
  if (calculationResult.error) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
        Error calculating salary: {calculationResult.error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SalaryPlanSelector
        employee={employee}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        refetchEmployees={refetchEmployees}
        isLoading={isLoading}
      />

      <CompensationDetails
        calculationData={calculationResult}
        salesAmount={salesAmount}
        selectedMonth={selectedMonth}
        isVisible={isCompensationVisible}
        onVisibilityChange={setIsCompensationVisible}
      />
    </div>
  );
}; 
