import React, { useEffect, useMemo, useState } from 'react';
import { BranchFilter } from '../components/BranchFilter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { EmployeeList } from '../components/employee-list/EmployeeList';
import { EmployeesTabProps, Employee } from '../types';
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
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Handlers for Edit Modal
  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
    console.log("Opening edit modal for:", employee); // Placeholder log
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (updatedData: Partial<Employee>) => {
    if (!editingEmployee) return;
    console.log("Saving employee:", editingEmployee.id, updatedData); // Placeholder log
    // TODO: Implement actual save logic using employeeService
    // try {
    //   await employeeService.updateEmployee(editingEmployee.id, updatedData);
    //   fetchEmployees(); // Refetch employee list
    //   handleCloseEditModal();
    // } catch (error) {
    //   console.error("Failed to save employee:", error);
    //   // TODO: Show error toast
    // }
    handleCloseEditModal(); // Close modal for now
  };
  
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
            onEditEmployee={handleOpenEditModal}
          />
        </ErrorBoundary>

        {/* Placeholder for Modal - to be replaced with EmployeeEditModal */}
        {isEditModalOpen && editingEmployee && (
          <div 
            style={{
              position: 'fixed', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              padding: '20px', 
              background: 'white', 
              border: '1px solid black',
              zIndex: 1000
            }}
          >
            <h3>Editing: {editingEmployee.name}</h3>
            <p>ID: {editingEmployee.id}</p>
            <button onClick={() => handleSaveEmployee({ name: 'Updated Name' })}>Save (Test)</button>
            <button onClick={handleCloseEditModal}>Close</button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EmployeesTab; 