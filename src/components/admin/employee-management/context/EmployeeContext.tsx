import React, { createContext, useContext, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Branch } from '@/components/admin/employee-management/hooks/useBranchManager';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface EmployeeContextType {
  employees: Employee[];
  branches: Branch[];
  selectedBranch: string | null;
  selectedDate: Date;
  isLoading: boolean;
  salesInputs: Record<string, string>;
  lastUpdated: string | null;
  isSubmitting: boolean;
  pagination: PaginationInfo;
  setSelectedBranch: (branchId: string | null) => void;
  setSelectedDate: (date: Date) => void;
  handleSalesChange: (employeeId: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  setCurrentPage: (page: number) => void;
  fetchEmployees: () => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{
  children: React.ReactNode;
  value: EmployeeContextType;
}> = ({ children, value }) => {
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(() => value, [
    value.employees,
    value.branches,
    value.selectedBranch,
    value.selectedDate,
    value.isLoading,
    value.salesInputs,
    value.lastUpdated,
    value.isSubmitting,
    value.pagination,
    value.setSelectedBranch,
    value.setSelectedDate,
    value.handleSalesChange,
    value.handleSubmit,
    value.setCurrentPage,
    value.fetchEmployees
  ]);

  return (
    <EmployeeContext.Provider value={memoizedValue}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error('useEmployeeContext must be used within an EmployeeProvider');
  }
  return context;
}; 