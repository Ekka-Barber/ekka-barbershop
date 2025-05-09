import React, { useState, useEffect } from 'react';
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
import { uploadEmployeePhoto } from '@/services/employeeService';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(
    employeeToEdit?.photo_url || undefined
  );

  useEffect(() => {
    setCurrentPhotoUrl(employeeToEdit?.photo_url || undefined);
  }, [employeeToEdit]);

  if (!isOpen) {
    return null;
  }

  const handlePhotoUploadCallback = async (file: File) => {
    try {
      const newPhotoUrl = await uploadEmployeePhoto(file);
      setCurrentPhotoUrl(newPhotoUrl);
      toast({
        title: "Photo Uploaded",
        description: "The new employee photo has been successfully uploaded.",
      });
    } catch (error) {
      console.error("Error uploading photo in modal:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not upload the photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  // The form submission will be handled by EmployeeForm's onSubmit, which calls onSave.
  // The onSave prop (implemented in EmployeesTab.tsx) will then handle closing the modal.
  const handleSubmitForm = async (formDataFromForm: Partial<Employee>) => {
    // Ensure the latest photo URL is included in the submission
    const submissionData = {
      ...formDataFromForm,
      photo_url: currentPhotoUrl || null, // Use the stateful currentPhotoUrl
    };
    await onSave(submissionData);
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
          onPhotoUpload={handlePhotoUploadCallback}
        />
      </DialogContent>
    </Dialog>
  );
}; 