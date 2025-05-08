import React, { createContext, useContext, useMemo } from 'react';
import { Employee } from '@/types/employee';
import { Branch, PaginationInfo } from '../types';

// Legacy context type with sales properties - kept for backward compatibility
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

// New context type without sales-specific properties
export interface BaseEmployeeContextType {
  employees: Employee[];
  branches: Branch[];
  selectedBranch: string | null;
  selectedDate: Date;
  isLoading: boolean;
  pagination: PaginationInfo;
  setSelectedBranch: (branchId: string | null) => void;
  setSelectedDate: (date: Date) => void;
  setCurrentPage: (page: number) => void;
  fetchEmployees: () => Promise<void>;
}

// Allow using either the full context or the base context
type FlexibleEmployeeContextType = BaseEmployeeContextType | EmployeeContextType;

// Function to check if a context has sales properties
export const hasSalesProperties = (
  context: FlexibleEmployeeContextType
): context is EmployeeContextType => {
  return 'salesInputs' in context && 'handleSalesChange' in context;
};

const EmployeeContext = createContext<FlexibleEmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{
  children: React.ReactNode;
  value: FlexibleEmployeeContextType;
}> = ({ children, value }) => {
  // Memoize the context value to prevent unnecessary re-renders
  const memoizedValue = useMemo(() => value, Object.values(value));

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