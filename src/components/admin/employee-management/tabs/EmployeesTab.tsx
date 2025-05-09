import React, { useEffect, useMemo, useState } from 'react';
// import { BranchFilter } from '../components/BranchFilter'; // No longer needed here
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useEmployeeManager, ArchiveStatusFilter } from '../hooks/useEmployeeManager';
import { useBranchManager } from '../hooks/useBranchManager';
import { EmployeeList } from '../components/employee-list/EmployeeList';
import { EmployeesTabProps } from '../types';
import { Employee } from '@/types/employee';
import { useUrlState } from '../hooks/useUrlState';
import { EmployeeEditModal } from '../components/employee-form/EmployeeEditModal';
import { updateEmployee, createEmployee, setEmployeeArchiveStatus } from '@/services/employeeService';
import { SalaryPlan } from '@/types/salaryPlan';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const EmployeesTab: React.FC<EmployeesTabProps> = ({ 
  initialBranchId = null // This prop might still be useful if parent passes it
}) => {
  const { currentState, syncUrlWithState } = useUrlState();
  const { toast } = useToast();
  const [activeArchiveFilter, setActiveArchiveFilter] = useState<ArchiveStatusFilter>('active');

  const { 
    branches, 
    selectedBranch, 
    isLoading: isBranchLoading
  } = useBranchManager(initialBranchId);
  
  const { 
    employees, 
    isLoading: isEmployeeLoading,
    fetchEmployees,
    pagination,
    setCurrentArchiveFilter,
    currentArchiveFilter
  } = useEmployeeManager(selectedBranch, activeArchiveFilter);
  
  // Fetch Salary Plans
  const {
    data: salaryPlans = [],
    isLoading: isSalaryPlansLoading,
  } = useQuery<SalaryPlan[], Error>({
    queryKey: ['salaryPlans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_plans')
        .select('id, name, type');
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

  // State for Archive Confirmation Dialog
  const [employeeToToggleArchive, setEmployeeToToggleArchive] = useState<Employee | null>(null);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);

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
        const { data: savedEmployee, error } = await updateEmployee(editingEmployee.id, formData);
        if (error) {
          console.error("Failed to update employee:", error);
          toast({ title: "Update Failed", description: error.message || "Could not update employee details.", variant: "destructive" });
        } else {
          toast({ title: "Success", description: `Employee ${savedEmployee?.name || ''} updated successfully.` });
          fetchEmployees(pagination.currentPage, currentArchiveFilter); 
          handleCloseEditModal();
        }
      } else {
        const  savedEmployee = await createEmployee(formData); 
        toast({ title: "Success", description: `Employee ${savedEmployee?.name || ''} created successfully.` });
        fetchEmployees(1, currentArchiveFilter);
        handleCloseEditModal();
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred while saving.";
      if (error instanceof Error) errorMessage = error.message;
      console.error("Exception when saving employee:", error);
      toast({ title: "Save Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  // Handlers for Archive Confirmation
  const handleOpenArchiveConfirm = (employee: Employee) => {
    setEmployeeToToggleArchive(employee);
    setIsArchiveConfirmOpen(true);
  };

  const handleCloseArchiveConfirm = () => {
    setEmployeeToToggleArchive(null);
    setIsArchiveConfirmOpen(false);
  };

  const handleConfirmArchiveToggle = async () => {
    if (!employeeToToggleArchive) return;

    const newArchiveState = !employeeToToggleArchive.is_archived;
    const actionText = newArchiveState ? "archived" : "restored";

    try {
      const { error } = await setEmployeeArchiveStatus(employeeToToggleArchive.id, newArchiveState);
      if (error) {
        console.error(`Failed to ${actionText} employee:`, error);
        toast({ title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Failed`, description: error.message || `Could not ${actionText} employee.`, variant: "destructive" });
      } else {
        toast({ title: "Success", description: `Employee ${employeeToToggleArchive.name} ${actionText} successfully.` });
        fetchEmployees(pagination.currentPage, currentArchiveFilter);
      }
    } catch (e) {
      let errorMessage = `An unexpected error occurred during ${actionText}.`;
      if (e instanceof Error) errorMessage = e.message;
      console.error(`Exception when ${actionText} employee:`, e);
      toast({ title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Error`, description: errorMessage, variant: "destructive" });
    } finally {
      handleCloseArchiveConfirm();
    }
  };

  const handleArchiveFilterChange = (value: string) => {
    const newFilter = value as ArchiveStatusFilter;
    setActiveArchiveFilter(newFilter);
    setCurrentArchiveFilter(newFilter);
  };
  
  // Keep URL in sync with component state
  useEffect(() => {
    if (
      selectedBranch !== currentState.branch ||
      pagination.currentPage !== currentState.page
    ) {
      syncUrlWithState(
        'employees', 
        selectedBranch,
        new Date(), 
        pagination.currentPage
      );
    }
  }, [selectedBranch, pagination.currentPage, syncUrlWithState, currentState]);
  
  /*const handleBranchChange = (branchId: string | null) => {
    setSelectedBranch(branchId);
  };*/

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* BranchFilter REMOVED FROM HERE 
        <div className="pb-4 border-b">
          <BranchFilter 
            branches={branches} 
            selectedBranch={selectedBranch} 
            onBranchChange={handleBranchChange} 
            isLoading={isBranchLoading} 
          />
        </div>
        */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
            <p className="text-muted-foreground">
              Manage your employees and their information
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={activeArchiveFilter} onValueChange={handleArchiveFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active Employees</SelectItem>
                <SelectItem value="archived">Archived Employees</SelectItem>
                <SelectItem value="all">All Employees</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleOpenCreateModal}>Create Employee</Button>
          </div>
        </div>
        
        <ErrorBoundary>
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            pagination={pagination}
            branches={branches}
            onEditEmployee={handleOpenEditModal}
            onArchiveEmployee={handleOpenArchiveConfirm}
          />
        </ErrorBoundary>

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

        {employeeToToggleArchive && (
          <AlertDialog open={isArchiveConfirmOpen} onOpenChange={setIsArchiveConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {employeeToToggleArchive.is_archived ? "Restore Employee?" : "Archive Employee?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {employeeToToggleArchive.is_archived 
                    ? `Are you sure you want to restore the employee "${employeeToToggleArchive.name}"? They will become active again.`
                    : `Are you sure you want to archive the employee "${employeeToToggleArchive.name}"? They will be hidden from active lists but their data will be preserved.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCloseArchiveConfirm}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmArchiveToggle}>
                  {employeeToToggleArchive.is_archived ? "Confirm Restore" : "Confirm Archive"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default EmployeesTab; 