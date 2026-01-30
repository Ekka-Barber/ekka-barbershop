// Calculation-specific types (keep business logic separate from DB types)
import { Employee, SalaryPlan } from '@shared/types/domains';

export interface SalaryCalculation {
  employeeId?: string;
  employeeName: string;
  sales: number;
  basicSalary: number;
  commission: number;
  targetBonus: number;
  extraBonuses: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  netSalary?: number;
  grossSalary?: number;
  salaryPlanName?: string;
}

export interface DynamicField {
  id?: string;
  description: string;
  amount: string;
  date?: string;
}

// Employee with joined branch data
export interface EmployeeWithBranch extends Employee {
  branches: {
    id: string;
    name: string;
    name_ar: string | null;
  } | null;
}

// Employee with joined salary plan data for calculations
export interface EmployeeWithSalaryPlan extends Employee {
  salary_plans: SalaryPlan;
}

// Business-level SalaryPlan with parsed config
