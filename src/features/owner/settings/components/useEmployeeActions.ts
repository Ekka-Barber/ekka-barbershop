import { useToast } from '@shared/hooks/use-toast';
import { supabase } from '@shared/lib/supabase/client';
import { Employee } from '@shared/types/domains';
import { logger } from '@shared/utils/logger';
export const useEmployeeActions = (
  resetForm: () => void,
  refetchEmployees: () => void,
  editingEmployee: Employee | null,
  setIsAddDialogOpen: (open: boolean) => void
) => {
  const { toast } = useToast();

  const handlePhotoUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('employee_photos').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      logger.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleSubmit = async (employeeData: {
    name: string;
    name_ar: string;
    nationality: string;
    role: string;
    branch_id: string;
    salary_plan_id: string;
    sponsor_id?: string;
    photo_url?: string;
    start_date?: string;
    end_date?: string;
    email?: string;
    annual_leave_quota?: number;
    is_archived?: boolean;
  }) => {
    if (!employeeData.role) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a role',
      });
      return;
    }

    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        const { error } = await supabase.from('employees').insert(employeeData);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Employee added successfully',
        });
      }

      resetForm();
      setIsAddDialogOpen(false);
      refetchEmployees();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('employees').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });

      refetchEmployees();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  return {
    handlePhotoUpload,
    handleSubmit,
    handleDelete,
  };
};
