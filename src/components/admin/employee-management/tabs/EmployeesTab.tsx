import React, { useEffect, useMemo } from 'react';
import { BranchFilter } from '../components/BranchFilter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { EmployeeList } from '../components/employee-list/EmployeeList';
import { EmployeesTabProps } from '../types';
import { useUrlState } from '../hooks/useUrlState';

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ 
  initialBranchId = null 
}) => {
  const { currentState, syncUrlWithState } = useUrlState();
  
  const { 
    branches, 
    selectedBranch, 
    setSelectedBranch,
    isLoading: isBranchLoading
  } = useBranchManager(initialBranchId);
  
  const { 
    employees, 
    isLoading: isEmployeeLoading,
    fetchEmployees,
    pagination,
    setCurrentPage
  } = useEmployeeManager(selectedBranch);
  
  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading, 
    [isBranchLoading, isEmployeeLoading]
  );
  
  // Keep URL in sync with component state
  useEffect(() => {
    if (
      selectedBranch !== currentState.branch ||
      pagination.currentPage !== currentState.page
    ) {
      syncUrlWithState(
        'employees', // Use the new tab name
        selectedBranch,
        new Date(), // Default date, not used in this tab
        pagination.currentPage
      );
    }
  }, [selectedBranch, pagination.currentPage, syncUrlWithState, currentState]);
  
  // Handle branch change
  const handleBranchChange = (branchId: string | null) => {
    setSelectedBranch(branchId);
    setCurrentPage(1);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground">
              Manage your employees and their information
            </p>
          </div>
          
          {/* Branch Filter Component */}
          <BranchFilter 
            branches={branches} 
            selectedBranch={selectedBranch} 
            onBranchChange={handleBranchChange} 
            isLoading={isBranchLoading} 
          />
        </div>
        
        {/* Employee List/Grid Component */}
        <ErrorBoundary>
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            refetchEmployees={fetchEmployees}
            branches={branches}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default EmployeesTab; 