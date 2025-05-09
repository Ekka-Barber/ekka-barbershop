import React, { useState } from 'react';
import { Employee } from '@/types/employee';
import { Branch, PaginationState } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedEmployeeCard } from './EnhancedEmployeeCard';

// DO NOT CHANGE API LOGIC
interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  branches?: Branch[];
  onEditEmployee?: (employee: Employee) => void;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  refetchEmployees?: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  isLoading,
  branches = [],
  onEditEmployee,
  pagination,
  onPageChange,
  refetchEmployees
}) => {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const toggleExpandEmployee = (employeeId: string) => {
    setExpandedEmployee(prev => prev === employeeId ? null : employeeId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(pagination?.pageSize || 6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-32 bg-muted animate-pulse"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-muted animate-pulse w-3/4 rounded mb-2"></div>
              <div className="h-4 bg-muted animate-pulse w-1/2 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No employees found. Add employees to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {employees.map(employee => (
        <EnhancedEmployeeCard
          key={employee.id}
          employee={employee}
          branches={branches}
          isExpanded={expandedEmployee === employee.id}
          onToggleExpand={() => toggleExpandEmployee(employee.id)}
          onEdit={() => onEditEmployee && onEditEmployee(employee)}
        />
      ))}
    </div>
  );
};

export default EmployeeList; 