import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole } from '@/types/employee';
import { Branch } from '@/types/branch';
import { SalaryPlan } from '@/types/salaryPlan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
// import { Textarea } from '@/components/ui/textarea'; // For potential multi-line inputs
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the shape of the form's state
interface EmployeeFormState {
  name: string;
  name_ar: string;
  branch_id?: string; // Will be string from Select value
  role: string;
  nationality: string;
  email: string;
  photo_url: string;
  salary_plan_id?: string; // Will be string from Select value
  start_date: string; // Stored as YYYY-MM-DD string from date input
  annual_leave_quota: string; // Stored as string from number input, empty means null
}

const employeeRoleValues: EmployeeRole[] = [
  "manager",
  "barber",
  "receptionist",
  "cleaner",
  "massage_therapist",
  "hammam_specialist"
];

// The props for the form component
interface EmployeeFormProps {
  initialData?: Employee | null;
  onSubmit: (formData: Partial<Employee>) => Promise<void>; // Submit payload as Partial<Employee>
  onCancel: () => void;
  isEditMode: boolean;
  branches: Branch[];
  salaryPlans: SalaryPlan[];
  onPhotoUpload: (file: File) => Promise<void>;
}

const defaultFormState: EmployeeFormState = {
  name: '',
  name_ar: '',
  branch_id: undefined,
  role: '',
  nationality: '',
  email: '',
  photo_url: '',
  salary_plan_id: undefined,
  start_date: '',
  annual_leave_quota: '',
};

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditMode,
  branches,
  salaryPlans,
  onPhotoUpload,
}) => {
  const [formData, setFormData] = useState<EmployeeFormState>(defaultFormState);
  // const [errors, setErrors] = useState<Record<keyof EmployeeFormState, string>>({}); // For Zod/validator

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        name_ar: initialData.name_ar || '',
        branch_id: initialData.branch_id || undefined,
        role: initialData.role || '',
        nationality: initialData.nationality || '',
        email: initialData.email || '',
        photo_url: initialData.photo_url || '',
        salary_plan_id: initialData.salary_plan_id || undefined,
        start_date: initialData.start_date ? initialData.start_date.toString().split('T')[0] : '',
        annual_leave_quota: initialData.annual_leave_quota?.toString() ?? '',
      });
    } else {
      setFormData(defaultFormState); // Reset to default for new employee
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof EmployeeFormState, value: string };
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof Pick<EmployeeFormState, 'branch_id' | 'salary_plan_id' | 'role'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : value })); // store undefined if "" selected (e.g. "None" for salary plan)
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onPhotoUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.branch_id) {
      console.error('Validation failed: Name, Role, and Branch are required.');
      // TODO: Implement proper UI error feedback (e.g., toast or field errors)
      return;
    }

    const payload: Partial<Employee> = {
      name: formData.name,
      name_ar: formData.name_ar || null,
      branch_id: formData.branch_id || null,
      role: formData.role as EmployeeRole,
      nationality: formData.nationality || null,
      email: formData.email || null,
      photo_url: formData.photo_url || null,
      salary_plan_id: formData.salary_plan_id || null,
      start_date: formData.start_date || null,
      annual_leave_quota: formData.annual_leave_quota === '' ? null : parseInt(formData.annual_leave_quota, 10),
    };
    
    // Ensure parsed annual_leave_quota is valid number or null
    if (payload.annual_leave_quota !== null && isNaN(payload.annual_leave_quota as number)) {
        payload.annual_leave_quota = null; // Or handle as validation error
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="flex flex-col items-center space-y-3 mb-6">
        <Avatar className="w-24 h-24 border">
          <AvatarImage src={formData.photo_url || undefined} alt={formData.name} />
          <AvatarFallback>{formData.name ? formData.name.charAt(0).toUpperCase() : 'E'}</AvatarFallback>
        </Avatar>
        <Input
          id="photo-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Label
          htmlFor="photo-upload-input"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md text-sm font-medium"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <Label htmlFor="name" className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="name_ar" className="block text-sm font-medium mb-1">Name (Arabic)</Label>
          <Input
            id="name_ar"
            name="name_ar"
            type="text"
            value={formData.name_ar}
            onChange={handleChange}
            dir="rtl"
          />
        </div>

        <div>
          <Label htmlFor="branch_id" className="block text-sm font-medium mb-1">Branch <span className="text-red-500">*</span></Label>
          <Select
            name="branch_id"
            value={formData.branch_id}
            onValueChange={(value) => handleSelectChange('branch_id', value)}
            required
          >
            <SelectTrigger id="branch_id">
              <SelectValue placeholder="Select a branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}{branch.name_ar ? ` (${branch.name_ar})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="role" className="block text-sm font-medium mb-1">Role <span className="text-red-500">*</span></Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => handleSelectChange('role', value)}
            required
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {employeeRoleValues.map(roleValue => (
                <SelectItem key={roleValue} value={roleValue}>
                  {roleValue.charAt(0).toUpperCase() + roleValue.slice(1).replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="nationality" className="block text-sm font-medium mb-1">Nationality</Label>
          <Input
            id="nationality"
            name="nationality"
            type="text"
            value={formData.nationality}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium mb-1">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="salary_plan_id" className="block text-sm font-medium mb-1">Salary Plan</Label>
          <Select
            name="salary_plan_id"
            value={formData.salary_plan_id}
            onValueChange={(value) => handleSelectChange('salary_plan_id', value)}
          >
            <SelectTrigger id="salary_plan_id">
              <SelectValue placeholder="Select a salary plan" />
            </SelectTrigger>
            <SelectContent>
              {salaryPlans.map(plan => (
                <SelectItem key={plan.id} value={plan.id}>{plan.name}{plan.name_ar ? ` (${plan.name_ar})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="annual_leave_quota" className="block text-sm font-medium mb-1">Annual Leave Quota (days)</Label>
          <Input
            id="annual_leave_quota"
            name="annual_leave_quota"
            type="number"
            min="0"
            value={formData.annual_leave_quota}
            onChange={handleChange}
            placeholder="e.g., 21"
          />
        </div>
      </div>

      {/* TODO: Add fields for working_hours (JSON), off_days (Array) - likely via Textarea or custom component */}

      <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel} aria-label="Cancel form submission">
          Cancel
        </Button>
        <Button type="submit" aria-label={isEditMode ? 'Update employee details' : 'Create new employee'}>
          {isEditMode ? 'Save Changes' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}; 