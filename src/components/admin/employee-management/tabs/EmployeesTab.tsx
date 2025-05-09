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
import { updateEmployee } from '@/services/employeeService';
import { SalaryPlan } from '@/types/salaryPlan';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (updatedData: Partial<Employee>) => {
    if (!editingEmployee || !editingEmployee.id) {
      toast({
        title: "Error",
        description: "No employee selected for update.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: savedEmployee, error } = await updateEmployee(editingEmployee.id, updatedData);
      if (error) {
        console.error("Failed to save employee:", error);
        toast({
          title: "Save Failed",
          description: error.message || "Could not update employee details.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Employee ${savedEmployee?.name || ''} updated successfully.`,
        });
        fetchEmployees(); // Refetch employee list
        handleCloseEditModal();
      }
    } catch (error) {
      console.error("Exception when saving employee:", error);
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
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

        {editingEmployee && (
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