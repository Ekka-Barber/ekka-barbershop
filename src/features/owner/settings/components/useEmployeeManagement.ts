import { useToast } from '@shared/hooks/use-toast';

import { useEmployeeActions } from './useEmployeeActions';
import { useEmployeeForm } from './useEmployeeForm';
import { useEmployeeQueries } from './useEmployeeQueries';

export const useEmployeeManagement = () => {
  const { toast } = useToast();
  const { employees, refetchEmployees, branches, salaryPlans, sponsors } =
    useEmployeeQueries();
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingEmployee,
    name,
    setName,
    nameAr,
    setNameAr,
    nationality,
    setNationality,
    role,
    setRole,
    branchId,
    setBranchId,
    salaryPlanId,
    setSalaryPlanId,
    sponsorId,
    setSponsorId,
    photoUrl,
    setPhotoUrl,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    email,
    setEmail,
    annualLeaveQuota,
    setAnnualLeaveQuota,
    isArchived,
    setIsArchived,
    resetForm,
    handleEdit,
  } = useEmployeeForm();

  const {
    handlePhotoUpload: uploadPhoto,
    handleSubmit: submitEmployee,
    handleDelete,
  } = useEmployeeActions(
    resetForm,
    refetchEmployees,
    editingEmployee,
    setIsAddDialogOpen
  );

  const handlePhotoUpload = async (file: File) => {
    try {
      const publicUrl = await uploadPhoto(file);
      setPhotoUrl(publicUrl);
      toast({
        title: 'Success',
        description: 'Photo uploaded successfully',
      });
    } catch {
      // Error already handled in uploadPhoto
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitEmployee({
      name,
      name_ar: nameAr,
      nationality: nationality.toUpperCase(),
      role,
      branch_id: branchId,
      salary_plan_id: salaryPlanId,
      sponsor_id: sponsorId || undefined,
      photo_url: photoUrl || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      email: email || undefined,
      annual_leave_quota: annualLeaveQuota,
      is_archived: isArchived,
    });
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingEmployee,
    name,
    setName,
    nameAr,
    setNameAr,
    nationality,
    setNationality,
    role,
    setRole,
    branchId,
    setBranchId,
    salaryPlanId,
    setSalaryPlanId,
    sponsorId,
    setSponsorId,
    photoUrl,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    email,
    setEmail,
    annualLeaveQuota,
    setAnnualLeaveQuota,
    isArchived,
    setIsArchived,
    employees,
    branches,
    salaryPlans,
    sponsors,
    handleSubmit,
    handleEdit,
    handleDelete,
    handlePhotoUpload,
  };
};
