import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription, // Uncomment if needed
  // DialogFooter, // Uncomment if form buttons are managed here
  // DialogClose, // Uncomment if explicit close button is needed here
} from '@/components/ui/dialog';
import { EmployeeForm } from './EmployeeForm';
import { Employee } from '@/types/employee';
import { Branch } from '@/types/branch';
import { SalaryPlan } from '@/types/salaryPlan';

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit: Employee | null;
  onSave: (updatedData: Partial<Employee>) => Promise<void>; // Or specific EmployeeFormData
  branches: Branch[];
  salaryPlans: SalaryPlan[];
}

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
  onSave,
  branches,
  salaryPlans,
}) => {
  if (!isOpen) {
    return null;
  }

  // The form submission will be handled by EmployeeForm's onSubmit, which calls onSave.
  // The onSave prop (implemented in EmployeesTab.tsx) will then handle closing the modal.
  const handleSubmitForm = async (formData: Partial<Employee>) => {
    await onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employeeToEdit ? 'Edit Employee Details' : 'Create New Employee'}</DialogTitle>
          {/* <DialogDescription>
            {employeeToEdit ? 'Make changes to the employee's profile.' : 'Fill in the details to add a new employee.'}
          </DialogDescription> */}
        </DialogHeader>
        <EmployeeForm
          initialData={employeeToEdit}
          onSubmit={handleSubmitForm}
          onCancel={onClose} // EmployeeForm's cancel button will call this
          isEditMode={!!employeeToEdit}
          branches={branches}
          salaryPlans={salaryPlans}
        />
      </DialogContent>
    </Dialog>
  );
}; 