import React from 'react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import { SimpleEmployee } from '@/components/admin/employee-management/hooks/useAllActiveEmployees';

interface SalaryHistoryEmployeeFilterProps {
  selectedEmployeeIds: Set<string>;
  onToggleEmployee: (employeeId: string) => void;
  className?: string;
  employees: SimpleEmployee[];
  isLoading: boolean;
  error: Error | null;
}

export const SalaryHistoryEmployeeFilter: React.FC<SalaryHistoryEmployeeFilterProps> = ({
  selectedEmployeeIds,
  onToggleEmployee,
  className,
  employees,
  isLoading,
  error,
}) => {
  if (error) {
    return <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md bg-red-50">Error loading employee filter.</div>;
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {isLoading && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-md" />
          ))}
        </>
      )}
      {!isLoading && employees.length === 0 && (
        <p className="text-sm text-muted-foreground italic p-2 text-center w-full">
          No employees found for the selected period.
        </p>
      )}
      {!isLoading && employees.map((employee) => (
        <Button
          key={employee.id}
          variant={selectedEmployeeIds.has(employee.id) ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleEmployee(employee.id)}
          className="transition-all duration-150 ease-in-out"
          title={employee.name}
        >
          {employee.name}
        </Button>
      ))}
    </div>
  );
}; 