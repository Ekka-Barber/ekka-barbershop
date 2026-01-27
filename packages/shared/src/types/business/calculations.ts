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

export interface SalaryCalculationResult {
  employeeId: string;
  employeeName: string;
  calculation: SalaryCalculation;
  period: string;
  generatedAt: Date;
}



export interface SalaryBreakdown {
  baseSalary: number;
  commissions: number;
  bonuses: number;
  deductions: number;
  loans: number;
  total: number;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalBaseSalary: number;
  totalCommissions: number;
  totalBonuses: number;
  totalDeductions: number;
  totalLoans: number;
  totalGrossPay: number;
  totalNetPay: number;
  period: string;
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
export interface SalaryPlanConfig {
  blocks: Array<{
    type: string;
    config: {
      basic_salary?: number;
      tiered_bonus?: Array<{
        sales_target: number;
        bonus: number;
      }>;
      commission?: number;
      [key: string]: unknown;
    };
  }>;
  [key: string]: unknown;
}

export interface SalaryPlanWithConfig {
  id: string;
  name_en: string;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  config: SalaryPlanConfig;
  created_at: string;
  updated_at: string;
}
