import React from 'react';
import { SalesInputCard } from './SalesInputCard';
import { Employee } from '@/types/employee';

interface SalesGridProps {
  employees: Employee[];
  salesInputs: Record<string, string>;
  onSalesChange: (employeeId: string, value: string) => void;
  selectedDate: Date;
  isLoading: boolean;
}

export const SalesGrid: React.FC<SalesGridProps> = ({
  employees,
  salesInputs,
  onSalesChange,
  selectedDate,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-[150px] bg-muted animate-pulse rounded" />
                <div className="h-3 w-[100px] bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-full bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="text-3xl font-semibold">No employees found</div>
        <p className="text-muted-foreground mt-2">
          There are no employees to display in the selected branch.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => (
        <SalesInputCard 
          key={employee.id} 
          employee={employee} 
          salesValue={salesInputs[employee.id] || ''} 
          onChange={(value) => onSalesChange(employee.id, value)}
          selectedDate={selectedDate}
        />
      ))}
    </div>
  );
};

export default SalesGrid; 