import { Employee } from '@shared/types/domains';

import { SalaryDetail, SalaryPlan, Transaction } from '../../types/salary';

/**
 * Data structure for sales information
 */
export interface SalesData {
  sales_amount: number;
  date: string;
}

/**
 * Parameters required for salary calculation
 */
export interface CalculationParams {
  employee: Employee;
  plan: SalaryPlan;
  salesAmount: number;
  bonuses: Transaction[];
  deductions: Transaction[];
  loans: Transaction[];
  selectedMonth: string; // Format: YYYY-MM
}

/**
 * Status information about a calculation
 */
export interface CalculationStatus {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Result of a salary calculation
 */
export interface CalculatorResult {
  baseSalary: number;
  commission: number;
  targetBonus?: number;
  bonus?: number;
  deductions?: number;
  loans?: number;
  total?: number;
  planType?: string;
  planName?: string;
  calculationStatus?: CalculationStatus;
  error?: string;
  details?: SalaryDetail[];
}
