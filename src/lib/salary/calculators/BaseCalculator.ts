
import { Employee } from '@/types/employee';
import { SalaryPlan, Transaction } from '../types/salary';
import { logger } from '@/utils/logger';

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
  salesData?: SalesData | null;
  selectedMonth?: string;
}

export interface CalculatorResult {
  baseSalary: number;
  commission: number;
  bonus?: number; // Regular bonuses from transactions
  targetBonus?: number; // Target bonus from salary plan
  deductions?: number;
  loans?: number;
  total?: number;
  planType?: string;
  planName?: string;
  error?: string | null;
  details?: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  calculationStatus?: {
    success: boolean;
    error?: string;
    details?: Record<string, unknown>;
  };
}

export abstract class BaseCalculator {
  
  abstract calculate(params: CalculationParams): Promise<CalculatorResult>;
  
  protected validateInput(params: CalculationParams): void {
    if (!params.employee) {
      throw new Error('Employee is required');
    }
    
    if (!params.plan) {
      throw new Error('Salary plan is required');
    }
    
    if (params.salesAmount === undefined || params.salesAmount === null) {
      logger.warn(`salesAmount is undefined or null for employee ${params.employee.name}, defaulting to 0`);
      params.salesAmount = 0;
    }
  }
  
  protected parseConfig(config: unknown): Record<string, unknown> {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch (error) {
        logger.error('Error parsing config string:', error);
        return {};
      }
    }
    
    return config as Record<string, unknown>;
  }
  
  protected handleCalculationError(error: unknown, params: CalculationParams): CalculatorResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Calculation error for ${params.employee.name}:`, error);
    
    return {
      baseSalary: 0,
      commission: 0,
      bonus: 0,
      targetBonus: 0,
      deductions: 0,
      loans: 0,
      total: 0,
      error: errorMessage,
      calculationStatus: {
        success: false,
        error: errorMessage,
        details: { error }
      }
    };
  }
}

// Defines the abstract SalaryCalculator interface
export abstract class SalaryCalculator extends BaseCalculator {}
