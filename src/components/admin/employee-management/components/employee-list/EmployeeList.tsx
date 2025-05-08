import React, { useState } from 'react';
import { Employee } from '@/types/employee';
import { Branch } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedEmployeeCard } from './EnhancedEmployeeCard';

// DO NOT CHANGE API LOGIC
interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  branches?: Branch[];
  onUpdateEmployee?: () => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees, 
  isLoading,
  branches = [],
  onUpdateEmployee
}) => {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);

  const toggleExpandEmployee = (employeeId: string) => {
    setExpandedEmployee(prev => prev === employeeId ? null : employeeId);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map(employee => (
        <EnhancedEmployeeCard
          key={employee.id}
          employee={employee}
          branches={branches}
          isExpanded={expandedEmployee === employee.id}
          onToggleExpand={() => toggleExpandEmployee(employee.id)}
          onUpdate={onUpdateEmployee}
        />
      ))}
    </div>
  );
};

export default EmployeeList; 