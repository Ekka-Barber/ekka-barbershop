import { Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import { TIME } from '@shared/constants/time';
import { useToast } from '@shared/hooks/use-toast';
import { DynamicField } from '@shared/types/business';
import { Employee } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';

import { EmployeeGrid } from '../components/EmployeeGrid';

interface SalesTabProps {
  salesInputs: Record<string, string>;
  onSalesChange: (employeeName: string, value: string) => void;
  employees: Employee[];
  onSubmit: (salesInputs: Record<string, string>) => void;
  selectedMonth?: string;
  monthlyDeductions?: Record<string, DynamicField[]>;
  monthlyLoans?: Record<string, DynamicField[]>;
  monthlyBonuses?: Record<string, DynamicField[]>;
  selectedBranch?: string;
  refetchEmployees?: () => void;
  // Salary plan assignment props
  onSalaryPlanChange?: (employeeId: string, planId: string) => void;
}

export const SalesTab = ({
  salesInputs,
  onSalesChange,
  employees,
  onSubmit,
  selectedMonth = new Date().toISOString().slice(0, TIME.DAYS_PER_WEEK),
  monthlyDeductions = {},
  monthlyLoans = {},
  monthlyBonuses = {},
  selectedBranch = '',
  refetchEmployees,
  onSalaryPlanChange,
}: SalesTabProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!employees.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No employees found for the selected branch
        </p>
      </div>
    );
  }

  const handleSubmit = async () => {
    // Check if there are any sales inputs
    const hasData = Object.values(salesInputs).some(
      (value) => value && parseFloat(value) > 0
    );

    if (!hasData) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'Please enter sales data for at least one employee',
      });
      return;
    }

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      // Call the original onSubmit function
      await onSubmit(salesInputs);

      // Show success state
      setIsSuccess(true);

      // Show success toast
      toast({
        title: 'Success!',
        description: 'Sales data has been submitted successfully',
      });

      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 2000);
    } catch {
      // Show error toast
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to submit sales data. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Submitting...
        </>
      );
    }

    if (isSuccess) {
      return (
        <>
          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
          Submitted!
        </>
      );
    }

    return 'Submit Sales';
  };

  return (
    <div className="space-y-6">
      <EmployeeGrid
        isLoading={false}
        employees={employees}
        salesInputs={salesInputs}
        selectedBranch={selectedBranch}
        onSalesChange={onSalesChange}
        refetchEmployees={refetchEmployees}
        selectedMonth={selectedMonth}
        monthlyDeductions={monthlyDeductions}
        monthlyLoans={monthlyLoans}
        monthlyBonuses={monthlyBonuses}
        onSalaryPlanChange={onSalaryPlanChange}
      />
      <div className="px-4">
        <Button
          onClick={handleSubmit}
          className={`w-full transition-all duration-300 ${
            isSuccess ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
          disabled={isSubmitting}
        >
          {getSubmitButtonContent()}
        </Button>
      </div>
    </div>
  );
};
