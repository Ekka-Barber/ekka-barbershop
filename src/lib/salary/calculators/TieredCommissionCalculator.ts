import { BaseCalculator, CalculationParams, CalculationResult } from './BaseCalculator';
import { SalaryCalculationResult, SalaryDetail } from '../types/salary';

interface TierConfig {
  threshold: number;
  rate: number;
  name?: string;
  min_sales?: number;
  max_sales?: number;
  commission_rate?: number;
}

interface TieredCommissionConfig {
  base_salary: number;
  tiers: TierConfig[];
}

export class TieredCommissionCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculationResult> {
    // Check cache first
    const cachedResult = this.getFromCache(params);
    if (cachedResult) {
      return {
        baseSalary: cachedResult.baseSalary,
        commission: cachedResult.commission,
        bonus: cachedResult.targetBonus,
        deductions: cachedResult.deductions,
        loans: cachedResult.loans,
        total: cachedResult.totalSalary,
        calculationStatus: { success: true }
      };
    }
    
    const { plan, salesAmount, bonuses = [], deductions = [], loans = [], selectedMonth } = params;
    const planConfig = this.parseConfig(plan.config) as { config?: TieredCommissionConfig };
    
    // Log the month-specific data for debugging
    if (selectedMonth) {
      console.debug(`Calculating tiered commission for month: ${selectedMonth}`);
      console.debug(`Bonuses count: ${bonuses.length}`);
      console.debug(`Deductions count: ${deductions.length}`);
      console.debug(`Loans count: ${loans.length}`);
    }
    
    // Extract configuration
    const config = planConfig.config || { base_salary: 0, tiers: [] };
    
    // Calculate base salary
    const baseSalary = config.base_salary || 0;
    
    // Calculate tiered commission
    let commission = 0;
    let appliedTier: TierConfig | null = null;
    
    if (config.tiers && Array.isArray(config.tiers)) {
      // In the original implementation, each tier had min_sales and max_sales
      // We'll check both formats for compatibility
      for (const tier of config.tiers) {
        // Support both formats: threshold/rate and min_sales/max_sales/commission_rate
        const minSales = tier.min_sales !== undefined ? tier.min_sales : tier.threshold || 0;
        const maxSales = tier.max_sales !== undefined ? tier.max_sales : Infinity;
        
        // Get the rate from either commission_rate or rate field, ensuring it's a decimal value
        const rate = tier.commission_rate !== undefined ? tier.commission_rate : tier.rate || 0;
        
        if (salesAmount >= minSales && salesAmount <= maxSales) {
          // Apply the commission rate directly - it should already be in decimal form (e.g., 0.2 for 20%)
          commission = salesAmount * rate;
          appliedTier = tier;
          console.debug(`Applied tier: ${minSales}-${maxSales} with rate ${rate} = ${commission}`);
          break; // Early exit once we find the applicable tier
        }
      }
    }
    
    // Calculate deductions total
    const deductionsTotal = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    
    // Calculate loans total
    const loansTotal = loans.reduce((sum, loan) => sum + loan.amount, 0);
    
    // Calculate bonus total
    const bonusesFromDb = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Calculate the total
    const total = baseSalary + Math.round(commission) + bonusesFromDb - deductionsTotal - loansTotal;
    
    // Create the result object in the format expected by the BaseCalculator
    const result: CalculationResult = {
      baseSalary,
      commission: Math.round(commission),
      bonus: bonusesFromDb,
      deductions: deductionsTotal,
      loans: loansTotal,
      total,
      calculationStatus: { success: true }
    };
    
    // Also save to cache in SalaryCalculationResult format
    const fullResult: SalaryCalculationResult = {
      baseSalary,
      commission: Math.round(commission),
      targetBonus: bonusesFromDb,
      deductions: deductionsTotal,
      loans: loansTotal,
      totalSalary: total,
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
        appliedTier,
        salesAmount
      })
    };
    
    // Save to cache and return
    this.saveToCache(params, fullResult);
    return result;
  }
  
  generateDetails(result: Partial<SalaryCalculationResult> & { 
    appliedTier?: TierConfig | null;
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
    
    if (result.commission && result.appliedTier) {
      const tier = result.appliedTier;
      const rate = tier.commission_rate !== undefined ? tier.commission_rate : tier.rate || 0;
      details.push({
        type: 'Tiered Commission',
        amount: Math.round(result.commission),
        description: `${rate} ${tier.name ? `(${tier.name})` : tier.min_sales !== undefined ? 
          `for sales between ${tier.min_sales.toLocaleString()} and ${(tier.max_sales || 'unlimited').toString().replace('Infinity', 'unlimited').toLocaleString()} SAR` :
          `for sales above ${tier.threshold?.toLocaleString() || 0} SAR`}`
      });
    }
    
    return details;
  }
} 
