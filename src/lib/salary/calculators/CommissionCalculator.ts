import { BaseCalculator, CalculationParameters } from './BaseCalculator';
import { SalaryCalculationResult, SalaryDetail } from '../types/salary';

interface CommissionConfig {
  base_salary: number;
  threshold: number;
  rate: number;
}

export class CommissionCalculator extends BaseCalculator {
  async calculate(params: CalculationParameters): Promise<SalaryCalculationResult> {
    // Check cache first
    const cachedResult = this.getFromCache(params);
    if (cachedResult) {
      return cachedResult;
    }
    
    const { plan, salesAmount, bonuses = [], deductions = [], loans = [], selectedMonth } = params;
    const planConfig = this.parseConfig(plan.config) as { config?: CommissionConfig };
    
    // Log the month-specific data for debugging
    if (selectedMonth) {
      console.debug(`Calculating commission for month: ${selectedMonth}`);
      console.debug(`Bonuses count: ${bonuses.length}`);
      console.debug(`Deductions count: ${deductions.length}`);
      console.debug(`Loans count: ${loans.length}`);
    }
    
    // Extract configuration
    const config = planConfig.config || { base_salary: 0, threshold: 0, rate: 0 };
    
    // Calculate base salary
    const baseSalary = config.base_salary || 0;
    
    // Calculate commission
    let commission = 0;
    const threshold = config.threshold || 0;
    const rate = config.rate || 0;
    
    if (salesAmount > threshold) {
      const commissionableAmount = salesAmount - threshold;
      commission = commissionableAmount * rate;
    }
    
    // Calculate deductions total
    const deductionsTotal = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    
    // Calculate loans total
    const loansTotal = loans.reduce((sum, loan) => sum + loan.amount, 0);
    
    // Calculate bonus total
    const bonusesFromDb = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Combine all calculated values
    const result: SalaryCalculationResult = {
      baseSalary,
      commission: Math.round(commission),
      targetBonus: 0,
      deductions: deductionsTotal,
      loans: loansTotal,
      totalSalary: baseSalary + Math.round(commission) + bonusesFromDb - deductionsTotal - loansTotal,
      planType: plan.type,
      planName: plan.name,
      isLoading: false,
      error: null,
      calculate: async () => {},
      calculationDone: true,
      bonusList: bonuses,
      deductionsList: deductions,
      details: this.generateDetails({
        baseSalary,
        commission,
        threshold,
        rate,
        salesAmount
      })
    };
    
    // Save to cache and return
    this.saveToCache(params, result);
    return result;
  }
  
  generateDetails(result: Partial<SalaryCalculationResult> & { 
    threshold?: number;
    rate?: number;
    salesAmount?: number;
  }): SalaryDetail[] {
    const details: SalaryDetail[] = [];
    
    if (result.baseSalary) {
      details.push({
        type: 'Base Salary',
        amount: result.baseSalary,
        description: 'Fixed base salary'
      });
    }
    
    if (result.commission && result.commission > 0) {
      details.push({
        type: 'Commission',
        amount: Math.round(result.commission),
        description: `${((result.rate || 0) * 100).toFixed(1)}% on sales above ${(result.threshold || 0).toLocaleString()} SAR`
      });
    }
    
    return details;
  }
} 