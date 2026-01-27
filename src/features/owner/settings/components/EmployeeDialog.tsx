import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/ui/components/dialog';

import { EmployeeForm } from './EmployeeForm';
import {
  Employee,
  EmployeeRole,
  SalaryPlan,
  Branch,
  Sponsor,
} from './EmployeeManagementTypes';

interface EmployeeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingEmployee: Employee | null;
  branches: Branch[];
  salaryPlans: SalaryPlan[];
  sponsors: Sponsor[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (value: string) => void;
  nameAr: string;
  setNameAr: (value: string) => void;
  nationality: string;
  setNationality: (value: string) => void;
  role: EmployeeRole | '';
  setRole: (value: EmployeeRole | '') => void;
  branchId: string;
  setBranchId: (value: string) => void;
  salaryPlanId: string;
  setSalaryPlanId: (value: string) => void;
  sponsorId: string;
  setSponsorId: (value: string) => void;
  annualLeaveQuota: number;
  setAnnualLeaveQuota: (value: number) => void;
  email: string;
  setEmail: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  isArchived: boolean;
  setIsArchived: (value: boolean) => void;
  onPhotoUpload: (file: File) => Promise<void>;
  photoUrl?: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const EmployeeDialog = ({
  isOpen,
  onOpenChange,
  editingEmployee,
  branches,
  salaryPlans,
  sponsors,
  onSubmit,
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
  annualLeaveQuota,
  setAnnualLeaveQuota,
  email,
  setEmail,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isArchived,
  setIsArchived,
  onPhotoUpload,
  photoUrl,
  isLoading,
  children,
}: EmployeeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
        </DialogHeader>
        <EmployeeForm
          editingEmployee={editingEmployee}
          branches={branches}
          salaryPlans={salaryPlans}
          sponsors={sponsors}
          onSubmit={onSubmit}
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
          onPhotoUpload={onPhotoUpload}
          photoUrl={photoUrl}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
