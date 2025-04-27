import { Employee } from '@/types/employee';

export interface FinancialTabProps {
  employee: Employee;
  currentMonth: string;
  refetchEmployees?: () => void;
}

export interface SubmitBonusData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

export interface SubmitDeductionData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

export interface SubmitLoanData {
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  branch_id: string | null;
  cash_deposit_id: string | null;
}

export interface EmployeeBonus {
  id: string;
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface EmployeeLoan {
  id: string;
  employee_id: string;
  employee_name: string;
  description: string;
  amount: number;
  date: string;
  source: string;
  branch_id: string | null;
  cash_deposit_id: string | null;
  created_at: string;
}

export interface CashDeposit {
  id: string;
  balance: number;
} 