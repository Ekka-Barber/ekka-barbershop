
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
   */
  getFromCache(params: CalculationParams): CalculatorResult | null {
    return null; // Default implementation returns null (no caching)
  }

  /**
   * Method to save calculation results to cache. Should be overridden by subclasses if needed.
   */
  saveToCache(key: string, result: any): void {
    // Default implementation does nothing
  }
  
  /**
   * Validates input parameters for calculation
   */
  protected validateInput(params: CalculationParams): void {
    if (!params.employee) {
      throw new Error('Employee data is required for salary calculation');
    }
    
    if (!params.plan) {
      throw new Error('Salary plan is required for salary calculation');
    }
    
    if (params.salesAmount === undefined) {
      throw new Error('Sales amount is required for salary calculation');
    }
  }
  
  /**
   * Parses configuration object from various formats
   */
  protected parseConfig(config: any): Record<string, any> {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch {
        return {};
      }
    }
    
    return config;
  }
  
  /**
   * Handle calculation errors in a standardized way
   */
  protected handleCalculationError(error: unknown, params: CalculationParams): CalculatorResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
    
    return {
      baseSalary: 0,
      commission: 0,
      total: 0,
      calculationStatus: {
        success: false,
        error: errorMessage,
        details: {
          employeeId: params.employee.id,
          planType: params.plan?.type || 'unknown',
          errorTime: new Date().toISOString()
        }
      },
      error: errorMessage
    };
  }
}

// Export Transaction type for use in other files
export { Transaction };

// Alias SalaryCalculator to BaseCalculator for backward compatibility
export type SalaryCalculator = BaseCalculator;
