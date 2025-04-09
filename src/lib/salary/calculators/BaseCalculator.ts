import { Employee } from '@/types/employee';
import { 
  SalaryPlan, 
  SalaryCalculationResult, 
  EmployeeBonus, 
  EmployeeDeduction,
  EmployeeSales,
  EmployeeLoan,
  SalaryDetail
} from '../types/salary';

export interface CalculationParameters {
  employee: Employee;
  plan: SalaryPlan;
  salesAmount: number;
  bonuses?: EmployeeBonus[];
  deductions?: EmployeeDeduction[];
  loans?: EmployeeLoan[];
  salesHistory?: EmployeeSales[];
  selectedMonth?: string; // Format: YYYY-MM
}

export interface SalaryCalculator {
  calculate(params: CalculationParameters): Promise<SalaryCalculationResult>;
  parseConfig(config: Record<string, unknown>): Record<string, unknown>;
  generateDetails(result: Partial<SalaryCalculationResult>): SalaryDetail[];
}

export abstract class BaseCalculator implements SalaryCalculator {
  protected cache: Map<string, SalaryCalculationResult> = new Map();

  abstract calculate(params: CalculationParameters): Promise<SalaryCalculationResult>;

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

  protected getCacheKey(params: CalculationParameters): string {
    const { employee, plan, salesAmount, selectedMonth = '' } = params;
    return `${employee.id}-${plan.id}-${salesAmount}-${selectedMonth}`;
  }

  protected getFromCache(params: CalculationParameters): SalaryCalculationResult | null {
    const key = this.getCacheKey(params);
    return this.cache.has(key) ? this.cache.get(key) || null : null;
  }

  protected saveToCache(params: CalculationParameters, result: SalaryCalculationResult): void {
    const key = this.getCacheKey(params);
    this.cache.set(key, result);
  }

  protected calculateTotal(result: Partial<SalaryCalculationResult>): number {
    const { baseSalary = 0, commission = 0, targetBonus = 0, deductions = 0, loans = 0 } = result;
    return baseSalary + commission + targetBonus - deductions - loans;
  }

  abstract generateDetails(result: Partial<SalaryCalculationResult>): SalaryDetail[];
} 
