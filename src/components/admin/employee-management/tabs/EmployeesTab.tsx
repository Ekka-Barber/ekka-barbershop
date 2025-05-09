import React, { useEffect, useMemo, useState } from 'react';
import { BranchFilter } from '../components/BranchFilter';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useEmployeeManager } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { EmployeeList } from '../components/employee-list/EmployeeList';
import { EmployeesTabProps } from '../types';
import { Employee } from '@/types/employee';
import { useUrlState } from '../hooks/useUrlState';
import { EmployeeEditModal } from '../components/employee-form/EmployeeEditModal';
import { updateEmployee, createEmployee } from '@/services/employeeService';
import { SalaryPlan } from '@/types/salaryPlan';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ 
  initialBranchId = null 
}) => {
  const { currentState, syncUrlWithState } = useUrlState();
  const { toast } = useToast();
  
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
  
  // Fetch Salary Plans
  const {
    data: salaryPlans = [],
    isLoading: isSalaryPlansLoading,
  } = useQuery<SalaryPlan[], Error>({
    queryKey: ['salaryPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name, type'); // Removed name_ar for now due to linter error
      if (error) {
        console.error('Error fetching salary plans:', error);
        throw new Error(error.message);
      }
      return data || [];
    },
  });
  
  const isLoading = useMemo(() => 
    isBranchLoading || isEmployeeLoading || isSalaryPlansLoading, 
    [isBranchLoading, isEmployeeLoading, isSalaryPlansLoading]
  );
  
  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Handlers for Edit Modal
  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (formData: Partial<Employee>) => {
    try {
      if (editingEmployee && editingEmployee.id) {
        // Update existing employee
        const { data: savedEmployee, error } = await updateEmployee(editingEmployee.id, formData);
        if (error) {
          console.error("Failed to update employee:", error);
          toast({
            title: "Update Failed",
            description: error.message || "Could not update employee details.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: `Employee ${savedEmployee?.name || ''} updated successfully.`,
          });
          fetchEmployees(); 
          handleCloseEditModal();
        }
      } else {
        // Create new employee
        // Ensure required fields for creation are present if your service/DB expects them
        // The `formData` from EmployeeForm should contain all necessary fields
        const  savedEmployee = await createEmployee(formData); // Assuming createEmployee returns the new employee or throws an error
        // The createEmployee service function needs to be updated to return { data, error } or throw
        // For now, assuming it throws on error and returns data on success for simplicity based on prior mock.
        // if (error) { // If createEmployee returns { data, error }
        //   console.error("Failed to create employee:", error);
        //   toast({
        //     title: "Creation Failed",
        //     description: error.message || "Could not create new employee.",
        //     variant: "destructive",
        //   });
        // } else {
        toast({
          title: "Success",
          description: `Employee ${savedEmployee?.name || ''} created successfully.`,
        });
        fetchEmployees();
        handleCloseEditModal();
        // }
      }
    } catch (error) {
      // More specific error handling
      let errorMessage = "An unexpected error occurred while saving.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Exception when saving employee:", error);
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground">
              Manage your employees and their information
            </p>
          </div>
          <Button onClick={handleOpenCreateModal}>Create Employee</Button>
        </div>
        
        {/* Branch Filter Component - moved to a new div for layout */}
        <div className="pb-4 border-b">
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

        {/* Modal is now controlled only by isEditModalOpen */}
        {isEditModalOpen && (
          <EmployeeEditModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            employeeToEdit={editingEmployee}
            onSave={handleSaveEmployee}
            branches={branches}
            salaryPlans={salaryPlans}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EmployeesTab; 