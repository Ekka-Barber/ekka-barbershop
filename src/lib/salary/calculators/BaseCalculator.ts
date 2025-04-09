
import { Employee } from '@/types/employee';
import { SalaryPlan, Transaction, SalaryDetail } from '../types/salary';

export interface SalesData {
  sales_amount: number;
  date: string;
}

export interface CalculationParams {
  employee: Employee;
  plan: SalaryPlan;
  salesAmount: number;
  bonuses: Transaction[];
  deductions: Transaction[];
  loans: Transaction[];
  selectedMonth: string; // Format: YYYY-MM
}

export interface CalculationStatus {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

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

/**
 * Abstract base class for salary calculators
 */
export abstract class BaseCalculator {
  protected cache = new Map<string, any>();

  /**
   * Calculate salary based on the provided parameters
   */
  abstract calculate(params: CalculationParams): Promise<CalculatorResult>;

  /**
   * Method to retrieve cached calculation results. Should be overridden by subclasses if needed.
   * Default implementation returns null to indicate no caching.
   */
  getFromCache(params: CalculationParams): null {
    return null; // Default implementation returns null (no caching)
  }

  /**
   * Method to save calculation results to cache. Should be overridden by subclasses if needed.
   * Default implementation does nothing.
   */
  saveToCache(key: string, result: any): void {
    // Default implementation does nothing
  }
}

// Alias SalaryCalculator to BaseCalculator for backward compatibility
export type SalaryCalculator = BaseCalculator;
