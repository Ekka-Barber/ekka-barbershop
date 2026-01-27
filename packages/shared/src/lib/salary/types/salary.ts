import type { EmployeeBonus, EmployeeDeduction } from '@shared/types/domains';

export type SalaryPlanType = 'fixed' | 'dynamic_basic';

// Business logic types for salary calculations
// Database types are now imported from @/types/domains

export interface SalaryBlock {
  type: string;
  config?: Record<string, unknown>;
}

export interface SalaryCalculationResult {
  baseSalary: number;
  commission: number;
  targetBonus: number; // Target bonus from salary plan
  regularBonus?: number; // Regular bonuses from transactions
  deductions: number;
  loans: number;
  totalSalary: number;
  planType: SalaryPlanType | null;
  planName: string | null;
  isLoading: boolean;
  error: string | null;
  calculate: () => Promise<void>;
  calculationDone: boolean;
  bonusList?: EmployeeBonus[];
  deductionsList?: EmployeeDeduction[];
  details?: SalaryDetail[];
}

export interface SalaryDetail {
  type: string;
  amount: number;
  description: string;
}

// Transaction interface for common transaction properties
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  employee_id: string;
}



// Re-exports from domains for backward compatibility
export type {
  SalaryPlan,
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeLoan,
  EmployeeSales,
} from '@shared/types/domains';
