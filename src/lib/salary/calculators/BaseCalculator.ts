
import { Employee } from '@/types/employee';
import { SalaryPlan, SalaryCalculationResult, SalaryDetail } from '../types/salary';

export interface Transaction {
  id: string;
  employee_id: string;
  date: string;
  amount: number;
  description: string;
}

export interface SalesData {
  sales_amount: number;
  commission_rate?: number;
  employee_id?: string;
  employee_name?: string;
}

export interface CalculationParams {
  employee: Employee;
  plan: SalaryPlan;
  salesAmount: number;
  bonuses: Transaction[];
  deductions: Transaction[];
  loans: Transaction[];
  selectedMonth: string;
}

export interface CalculatorResult {
  baseSalary: number;
  commission: number;
  bonus: number;
  deductions: number;
  loans: number;
  total: number;
  planType?: string | null;
  planName?: string | null;
  error?: string | null;
  details?: SalaryDetail[];
  calculationStatus?: {
    success: boolean;
    error?: string;
    details?: Record<string, unknown>;
  };
}

export interface SalaryCalculator {
  calculate(params: CalculationParams): Promise<CalculatorResult>;
  parseConfig(config: Record<string, unknown>): Record<string, unknown>;
  generateDetails(result: Partial<SalaryCalculationResult>): SalaryDetail[];
}

export abstract class BaseCalculator implements SalaryCalculator {
  protected cache: Map<string, SalaryCalculationResult> = new Map();

  abstract calculate(params: CalculationParams): Promise<CalculatorResult>;

  parseConfig(config: Record<string, unknown>): Record<string, unknown> {
    if (!config) return {};
    
    if (typeof config === 'string') {
      try {
        return JSON.parse(config);
      } catch (error) {
        console.error('Error parsing config string:', error);
        return {};
      }
    }
    
    return config;
  }

  protected getCacheKey(params: CalculationParams): string {
    const { employee, plan, salesAmount, selectedMonth = '' } = params;
    return `${employee.id}-${plan.id}-${salesAmount}-${selectedMonth}`;
  }

  protected getFromCache(params: CalculationParams): SalaryCalculationResult | null {
    const key = this.getCacheKey(params);
    return this.cache.has(key) ? this.cache.get(key) || null : null;
  }

  protected saveToCache(params: CalculationParams, result: SalaryCalculationResult): void {
    const key = this.getCacheKey(params);
    this.cache.set(key, result);
  }

  protected calculateTotal(result: Partial<SalaryCalculationResult>): number {
    const { baseSalary = 0, commission = 0, targetBonus = 0, deductions = 0, loans = 0 } = result;
    return baseSalary + commission + targetBonus - deductions - loans;
  }

  abstract generateDetails(result: Partial<SalaryCalculationResult>): SalaryDetail[];

  protected handleCalculationError(error: unknown, params: CalculationParams): CalculatorResult {
    // Log error details for debugging
    console.error(`Salary calculation error for ${params.employee.name}:`, error);
    
    let errorMessage = 'Unknown calculation error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return {
      baseSalary: 0,
      commission: 0,
      bonus: 0,
      deductions: 0,
      loans: 0,
      total: 0,
      error: errorMessage,
      calculationStatus: {
        success: false,
        error: errorMessage,
        details: {
          employeeId: params.employee.id,
          employeeName: params.employee.name,
          planId: params.plan.id,
          planType: params.plan.type,
          planConfig: params.plan.config,
          salesAmount: params.salesAmount
        }
      }
    };
  }
  
  protected validateInput(params: CalculationParams): boolean {
    if (!params.employee) {
      throw new Error('Employee data is missing');
    }
    
    if (!params.plan) {
      throw new Error(`No salary plan found for employee ${params.employee.name}`);
    }
    
    if (!params.plan.config) {
      throw new Error(`Salary plan ${params.plan.id} has no configuration`);
    }
    
    return true;
  }
}
