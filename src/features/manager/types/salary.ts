import type {
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeLoan,
} from '@shared/types/domains';

export type SalaryPlanType = 'fixed' | 'dynamic_basic';

export interface SalaryBlock {
  type: string;
  config?: Record<string, unknown>;
}

export interface SalaryCalculationResult {
  baseSalary: number;
  commission: number;
  targetBonus: number;
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
  loansList?: EmployeeLoan[];
}
