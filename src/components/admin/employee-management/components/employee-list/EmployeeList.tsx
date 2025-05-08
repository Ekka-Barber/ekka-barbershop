import React from 'react';
import { Employee, Branch, PaginationState } from '../../../types';
import { Button } from '@/components/ui/button';

interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  refetchEmployees?: () => void;
  branches?: Branch[];
}

// Temporary placeholder for EmployeeCard until we implement the proper component
const EmployeeCard: React.FC<{ 
  employee: Employee;
  branches?: Branch[];
  onUpdate?: () => void;
}> = ({ employee }) => (
  <div className="bg-card rounded-lg border shadow-sm p-4">
    <div className="flex items-center space-x-4 mb-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
        {employee.name.substring(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="font-medium">{employee.name}</div>
        <div className="text-sm text-muted-foreground">{employee.role}</div>
      </div>
    </div>
    <div className="text-sm">
      <p>📍 Branch: {employee.branchId}</p>
      {employee.email && <p>📧 {employee.email}</p>}
      {employee.phone && <p>📱 {employee.phone}</p>}
    </div>
  </div>
);

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading,
  pagination,
  onPageChange,
  refetchEmployees,
  branches = []
}) => {
  // Loading skeleton for employee cards
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
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
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
          {pagination.totalItems === 0
            ? "There are no employees in this branch yet. Add some employees to get started."
            : "No employees match your current filters. Try changing your search or filter settings."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard 
            key={employee.id} 
            employee={employee} 
            branches={branches}
            onUpdate={refetchEmployees}
          />
        ))}
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className="h-9 w-9 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeeList; 