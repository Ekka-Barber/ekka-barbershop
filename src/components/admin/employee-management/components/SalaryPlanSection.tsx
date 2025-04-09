
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalaryCalculation } from '@/lib/salary/hooks/useSalaryCalculation';
import { getCurrentMonth } from './salary-plan/utils';
import { SalaryPlanSelector } from './salary-plan/SalaryPlanSelector';
import { CompensationDetails } from './salary-plan/CompensationDetails';

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

  // Use the salary calculation hook
  const {
    baseSalary,
    commission,
    targetBonus,
    regularBonus,
    deductions,
    loans,
    totalSalary,
    planName,
    details,
    isLoading,
    error,
    calculationDone
  } = useSalaryCalculation({
    employee,
    salesAmount,
    selectedMonth
  });

  // Combined loading state
  const isLoadingCalculation = isLoading && !calculationDone;

  if (isLoadingCalculation) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Handle salary calculation error
  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
        Error calculating salary: {error}
      </div>
    );
  }

  const totalBonus = (targetBonus || 0) + (regularBonus || 0);

  return (
    <div className="space-y-4">
      <SalaryPlanSelector
        employee={employee}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        refetchEmployees={refetchEmployees}
      />

      <CompensationDetails
        planName={planName}
        baseSalary={baseSalary || 0}
        commission={commission || 0}
        targetBonus={totalBonus}
        deductions={deductions || 0}
        loans={loans || 0}
        totalSalary={totalSalary || 0}
        salesAmount={salesAmount}
        selectedMonth={selectedMonth}
        isLoading={isLoading}
        calculationDone={calculationDone || false}
        salaryDetails={details || []}
        isVisible={isCompensationVisible}
        onVisibilityChange={setIsCompensationVisible}
      />
    </div>
  );
}; 
