
export type SalaryPlanType = 
  | "fixed" 
  | "commission" 
  | "dynamic_basic" 
  | "commission_only" 
  | "tiered_commission" 
  | "team_commission";

export interface SalaryPlan {
  id: string;
  type: SalaryPlanType;
  name: string;
  config: Record<string, unknown>;
}

export interface SalaryBlock {
  type: string;
  config?: Record<string, unknown>;
}

export interface EmployeeBonus {
  id: string;
  amount: number;
  date: string;
  description: string;
  employee_id: string; // Changed from optional to required
  employee_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDeduction {
  id: string;
  amount: number;
  date: string;
  description: string;
  employee_id: string; // Changed from optional to required
  employee_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeSales {
  amount: number;
  month: string;
  updated_at: string;
}

export interface EmployeeLoan {
  id: string; // Changed from optional to required
  amount: number;
  date: string;
  employee_id: string; // Changed from optional to required
  description: string; // Changed from optional to required
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
  details?: SalaryDetail[];
}

export interface SalaryDetail {
  type: string;
  amount: number;
  description: string;
} 

// Define the Transaction interface (already exported in the file)
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  employee_id: string;
}

// Define the CalculationResult interface to match what's expected in useSalaryCalculation.ts
export interface CalculationResult {
  baseSalary: number;
  commission: number;
  targetBonus: number; // Added to match what's used
  deductions: number;
  loans: number;
  totalSalary: number; // Added to match what's used
  planType: SalaryPlanType | null;
  planName: string | null;
  error: string | null; // Added to match what's used
  details?: SalaryDetail[]; // Added to match what's used
}
