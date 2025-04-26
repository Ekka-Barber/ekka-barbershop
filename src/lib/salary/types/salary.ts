export type SalaryPlanType = 
  | "fixed" 
  | "commission" 
  | "dynamic_basic" 
  | "commission_only" 
  | "tiered_commission" 
  | "team_commission"
  | "formula";

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
  employee_id: string; // Required
  employee_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeDeduction {
  id: string;
  amount: number;
  date: string;
  description: string;
  employee_id: string; // Required
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
  id: string; // Required
  amount: number;
  date: string;
  employee_id: string; // Required
  description: string; // Required
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

// Interfaces for formula-based salary configuration
export interface FormulaVariable {
  name: string;
  description: string;
  defaultValue?: number;
  source?: 'employee' | 'sales' | 'transaction' | 'constant';
  path?: string; // For accessing nested properties
}

export interface FormulaOperator {
  type: 'add' | 'subtract' | 'multiply' | 'divide' | 'if' | 'min' | 'max';
  parameters: (string | number | FormulaStep)[];
}

export interface FormulaStep {
  id: string;
  name: string;
  description?: string;
  operation: FormulaOperator | string; // String for variable references or literal values
  result?: string; // Name of the result variable
}

export interface FormulaPlan {
  variables: FormulaVariable[];
  steps: FormulaStep[];
  outputVariable: string; // The final variable that holds the result
}
