import { useState } from 'react';

import { Employee } from '@shared/types/domains';

import { EmployeeRole } from './EmployeeManagementTypes';

export const useEmployeeForm = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [nationality, setNationality] = useState('');
  const [role, setRole] = useState<EmployeeRole | ''>('');
  const [branchId, setBranchId] = useState<string>('');
  const [salaryPlanId, setSalaryPlanId] = useState<string>('');
  const [sponsorId, setSponsorId] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [annualLeaveQuota, setAnnualLeaveQuota] = useState<number>(21);
  const [isArchived, setIsArchived] = useState<boolean>(false);

  const resetForm = () => {
    setName('');
    setNameAr('');
    setNationality('');
    setRole('');
    setBranchId('');
    setSalaryPlanId('');
    setSponsorId('');
    setPhotoUrl('');
    setStartDate('');
    setEndDate('');
    setEmail('');
    setAnnualLeaveQuota(21);
    setIsArchived(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    if (editingEmployee?.id === employee.id) {
      resetForm();
    } else {
      setEditingEmployee(employee);
      setName(employee.name);
      setNameAr(employee.name_ar || '');
      setNationality(employee.nationality || '');
      setRole(employee.role);
      setBranchId(employee.branch_id || '');
      setSalaryPlanId(employee.salary_plan_id || '');
      setSponsorId(employee.sponsor_id || '');
      setPhotoUrl(employee.photo_url || '');
      setStartDate(employee.start_date || '');
      setEndDate(employee.end_date || '');
      setEmail(employee.email || '');
      setAnnualLeaveQuota(employee.annual_leave_quota || 21);
      setIsArchived(employee.is_archived || false);
    }
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingEmployee,
    setEditingEmployee,
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
  };
};
