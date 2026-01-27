import { UserPlus } from 'lucide-react';

import { Button } from '@shared/ui/components/button';

import { EmployeeDialog } from './EmployeeDialog';
import { EmployeeForm } from './EmployeeForm';
import { EmployeeTable } from './EmployeeTable';
import { useEmployeeManagement } from './useEmployeeManagement';

export const EmployeeManagement = () => {
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
  } = useEmployeeManagement();

  const availableSalaryPlans = salaryPlans || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Employee Management</h3>
        <EmployeeDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          editingEmployee={null}
          branches={branches || []}
          salaryPlans={availableSalaryPlans}
          sponsors={sponsors || []}
          onSubmit={handleSubmit}
          name={name}
          setName={setName}
          nameAr={nameAr}
          setNameAr={setNameAr}
          nationality={nationality}
          setNationality={setNationality}
          role={role}
          setRole={setRole}
          branchId={branchId}
          setBranchId={setBranchId}
          salaryPlanId={salaryPlanId}
          setSalaryPlanId={setSalaryPlanId}
          sponsorId={sponsorId}
          setSponsorId={setSponsorId}
          annualLeaveQuota={annualLeaveQuota}
          setAnnualLeaveQuota={setAnnualLeaveQuota}
          email={email}
          setEmail={setEmail}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          isArchived={isArchived}
          setIsArchived={setIsArchived}
          onPhotoUpload={handlePhotoUpload}
          photoUrl={photoUrl}
        >
          <Button>
            <UserPlus className="mr-2" />
            Add Employee
          </Button>
        </EmployeeDialog>
      </div>

      <EmployeeTable
        employees={employees || []}
        onEdit={handleEdit}
        onDelete={handleDelete}
        editingEmployee={editingEmployee}
        editForm={
          editingEmployee && (
            <div className="mt-4 p-4 border rounded-lg bg-background">
              <EmployeeForm
                editingEmployee={editingEmployee}
                branches={branches || []}
          salaryPlans={availableSalaryPlans}
                sponsors={sponsors || []}
                onSubmit={handleSubmit}
                name={name}
                setName={setName}
                nameAr={nameAr}
                setNameAr={setNameAr}
                nationality={nationality}
                setNationality={setNationality}
                role={role}
                setRole={setRole}
                branchId={branchId}
                setBranchId={setBranchId}
                salaryPlanId={salaryPlanId}
                setSalaryPlanId={setSalaryPlanId}
                sponsorId={sponsorId}
                setSponsorId={setSponsorId}
                annualLeaveQuota={annualLeaveQuota}
                setAnnualLeaveQuota={setAnnualLeaveQuota}
                email={email}
                setEmail={setEmail}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                isArchived={isArchived}
                setIsArchived={setIsArchived}
                onPhotoUpload={handlePhotoUpload}
                photoUrl={photoUrl}
              />
            </div>
          )
        }
      />
    </div>
  );
};
