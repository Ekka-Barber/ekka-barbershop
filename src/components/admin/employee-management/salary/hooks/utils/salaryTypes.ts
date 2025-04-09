
import { Employee } from '@/types/employee';
import { SalesData } from '@/lib/salary/calculators/BaseCalculator';
import { Transaction } from '@/lib/salary/types/salary';

export interface EmployeeSalary {
  id: string;
  name: string;
  baseSalary: number;
  commission: number;
  bonus: number;
  deductions: number;
  loans: number;
  total: number;
  calculationError?: string;
}

export interface UseSalaryDataProps {
  employees: Employee[];
  selectedMonth: string;
}

export interface UseSalaryDataResult {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  getEmployeeTransactions: (employeeId: string) => {
    bonuses: Transaction[];
    deductions: Transaction[];
    loans: Transaction[];
    salesData: SalesData | null;
  };
  calculationErrors: {
    employeeId: string;
    employeeName: string;
    error: string;
    details?: Record<string, unknown>;
  }[];
  refreshData: () => void;
}

export interface SalaryCalculationError {
  employeeId: string;
  employeeName: string;
  error: string;
  details?: Record<string, unknown>;
}
