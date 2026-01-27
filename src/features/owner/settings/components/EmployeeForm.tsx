import { Upload } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/components/avatar';
import { Button } from '@shared/ui/components/button';
import { Checkbox } from '@shared/ui/components/checkbox';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

import {
  Employee,
  EmployeeRole,
  SalaryPlan,
  Branch,
  Sponsor,
} from './EmployeeManagementTypes';

interface EmployeeFormProps {
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
  isLoading?: boolean; // Added for submit button state
}

export const EmployeeForm = ({
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
}: EmployeeFormProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onPhotoUpload(file);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 py-2 pb-6">
      {/* Photo Upload Section - remains centered */}
      <div className="flex flex-col items-center gap-3 mb-6 pt-2">
        <Avatar className="w-24 h-24 border">
          <AvatarImage src={photoUrl} alt={name} />
          <AvatarFallback>
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          {' '}
          {/* Removed items-center gap-2 to allow label to be full width on mobile if needed */}
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
            aria-label="Upload employee photo"
          />
          <Label
            htmlFor="photo-upload"
            className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md shadow-sm w-full sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
          </Label>
        </div>
      </div>

      {/* Form Fields - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name (English)</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full"
            placeholder="Enter English name"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nameAr">Name (Arabic)</Label>
          <Input
            id="nameAr"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            dir="rtl"
            className="w-full text-right"
            placeholder="أدخل الاسم بالعربية"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
            placeholder="employee@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nationality">Nationality (2-Letter Code)</Label>
          <Input
            id="nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value.toUpperCase())}
            placeholder="e.g., SA, EG, IN"
            maxLength={2}
            className="w-full uppercase"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select
            value={role}
            onValueChange={(value: EmployeeRole) => setRole(value)}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="barber">Barber</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="cleaner">Cleaner</SelectItem>
              <SelectItem value="massage_therapist">
                Massage Therapist
              </SelectItem>
              <SelectItem value="hammam_specialist">
                Hammam Specialist
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="annualLeaveQuota">Annual Leave Quota (Days)</Label>
          <Input
            id="annualLeaveQuota"
            type="number"
            min="0"
            step="1"
            value={annualLeaveQuota}
            onChange={(e) => setAnnualLeaveQuota(Number(e.target.value))}
            className="w-full"
            placeholder="21"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full"
            placeholder="Leave empty if still employed"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="branch">Branch</Label>
          <Select value={branchId} onValueChange={setBranchId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches?.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
              {(!branches || branches.length === 0) && (
                <p className="p-2 text-sm text-muted-foreground">
                  No branches available.
                </p>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="salaryPlan">Salary Plan</Label>
          <Select value={salaryPlanId} onValueChange={setSalaryPlanId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select salary plan" />
            </SelectTrigger>
            <SelectContent>
              {salaryPlans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
              {(!salaryPlans || salaryPlans.length === 0) && (
                <p className="p-2 text-sm text-muted-foreground">
                  No salary plans available.
                </p>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="sponsor">Sponsor</Label>
          <Select value={sponsorId} onValueChange={setSponsorId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sponsor (optional)" />
            </SelectTrigger>
            <SelectContent>
              {sponsors?.map((sponsor) => (
                <SelectItem key={sponsor.id} value={sponsor.id}>
                  {sponsor.name_ar} - {sponsor.cr_number}
                </SelectItem>
              ))}
              {(!sponsors || sponsors.length === 0) && (
                <p className="p-2 text-sm text-muted-foreground">
                  No sponsors available.
                </p>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex items-center space-x-2">
          <Checkbox
            id="isArchived"
            checked={isArchived}
            onCheckedChange={setIsArchived}
          />
          <Label
            htmlFor="isArchived"
            className="font-normal text-sm cursor-pointer"
          >
            Archive Employee
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 mt-6 border-t border-border">
        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
          {isLoading
            ? editingEmployee
              ? 'Updating...'
              : 'Adding...'
            : editingEmployee
              ? 'Update Employee'
              : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
};
