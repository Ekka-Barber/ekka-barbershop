
import { Employee } from '@/types/employee';
import { 
  SalaryPlanType, 
  SalaryPlan, 
  EmployeeBonus, 
  EmployeeDeduction,
  EmployeeLoan,
  Transaction,
  SalaryDetail
} from '../../types/salary';

export interface UseSalaryCalculationParams {
  employee: Employee;
  salesAmount: number;
  selectedMonth: string; // Format: YYYY-MM
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

export interface PlanQueryResult {
  data: SalaryPlan | null;
  isLoading: boolean;
}

export interface TransactionQueryResult<T> {
  data: T[];
  isLoading: boolean;
}
