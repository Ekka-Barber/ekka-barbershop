import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { SalaryDetail } from '../types/salary';

/**
 * Tiered Commission Calculator - calculates salary based on tiered commission rates
 */
export class TieredCommissionCalculator extends BaseCalculator {
  private readonly cacheKey = 'tiered-commission-calculation';
  
  /**
   * Override getFromCache to provide tiered commission specific caching
   */
  override getFromCache(params: CalculationParams): CalculatorResult | null {
    if (!params.selectedMonth || !params.employee.id) return null;
    
    const key = `${this.cacheKey}-${params.employee.id}-${params.selectedMonth}`;
    return this.cache.get(key) || null;
  }
  
  /**
   * Override saveToCache for tiered commission specific caching
   */
  override saveToCache(key: string, result: CalculatorResult): void {
    this.cache.set(key, result);
  }
  
  /**
   * Calculate salary based on tiered commission structure
   */
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    // Check if we have a cached result
    const cachedResult = this.getFromCache(params);
    if (cachedResult) {
      return cachedResult;
    }
    
    const { employee, plan, salesAmount, bonuses, deductions, loans } = params;
    const planConfig = this.parsePlanConfig(plan.config);
    const details: SalaryDetail[] = [];
    
    // Calculate base salary
    const baseSalary = planConfig.baseSalary || 0;
    details.push({
      type: 'Base Salary',
      amount: baseSalary,
      description: 'Base salary component'
    });
    
    // Calculate commission based on tiers
    let commission = 0;
    if (planConfig.tiers && Array.isArray(planConfig.tiers) && salesAmount > 0) {
      const tierDetails = this.calculateTieredCommission(salesAmount, planConfig.tiers);
      commission = tierDetails.commission;
      
      // Add details for each tier contribution
      tierDetails.tierContributions.forEach(tc => {
        details.push({
          type: `Tier Commission (${tc.tierName})`,
          amount: tc.contribution,
          description: `${tc.tierName}: ${tc.percentage}% of ${tc.amount} SAR`
        });
      });
    }
    
    // Calculate bonuses from separate bonus transactions
    const bonusTotal = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    if (bonusTotal > 0) {
      details.push({
        type: 'Additional Bonuses',
        amount: bonusTotal,
        description: `${bonuses.length} bonus transaction(s)`
      });
    }
    
    // Calculate any target/performance bonuses from the plan
    let targetBonus = 0;
    if (planConfig.targetBonus && salesAmount >= planConfig.targetSales) {
      targetBonus = planConfig.targetBonus;
      details.push({
        type: 'Target Bonus',
        amount: targetBonus,
        description: `Performance bonus for meeting sales target of ${planConfig.targetSales} SAR`
      });
    }
    
    // Calculate deductions
    const deductionsTotal = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    if (deductionsTotal > 0) {
      details.push({
        type: 'Deductions',
        amount: deductionsTotal,
        description: `${deductions.length} deduction transaction(s)`
      });
    }
    
    // Calculate loans
    const loansTotal = loans.reduce((sum, loan) => sum + loan.amount, 0);
    if (loansTotal > 0) {
      details.push({
        type: 'Loan Payments',
        amount: loansTotal,
        description: `${loans.length} loan payment(s)`
      });
    }
    
    // Calculate total
    const total = baseSalary + commission + targetBonus + bonusTotal - deductionsTotal - loansTotal;
    
    // Create final result
    const result: CalculatorResult = {
      baseSalary,
      commission,
      targetBonus,
      bonus: bonusTotal,
      deductions: deductionsTotal,
      loans: loansTotal,
      total,
      planType: 'tiered_commission',
      planName: plan.name || 'Tiered Commission Plan',
      details
    };
    
    // Cache the result
    const cacheKey = `${this.cacheKey}-${employee.id}-${params.selectedMonth}`;
    this.saveToCache(cacheKey, result);
    
    return result;
  }
  
  /**
   * Helper to parse the plan configuration safely
   */
  private parsePlanConfig(config: any): any {
    return this.parseConfig(config);
  }
  
  /**
   * Calculate commission based on tiered structure
   */
  private calculateTieredCommission(salesAmount: number, tiers: any[]): {
    commission: number;
    tierContributions: Array<{
      tierName: string;
      amount: number;
      percentage: number;
      contribution: number;
    }>;
  } {
    let commission = 0;
    const tierContributions = [];
    
    // Sort tiers by thresholds in ascending order
    const sortedTiers = [...tiers].sort((a, b) => a.threshold - b.threshold);
    
    let remainingSales = salesAmount;
    let previousThreshold = 0;
    
    for (const tier of sortedTiers) {
      const { threshold, percentage, name } = tier;
      
      if (salesAmount < threshold) {
        break; // We haven't reached this tier yet
      }
      
      // Calculate the sales amount that falls within this tier
      const tierMax = threshold;
      const tierMin = previousThreshold;
      let tierSales = Math.min(remainingSales, tierMax - tierMin);
      
      // Calculate commission for this tier
      const tierCommission = (tierSales * percentage) / 100;
      commission += tierCommission;
      
      tierContributions.push({
        tierName: name || `${threshold} SAR Tier`,
        amount: tierSales,
        percentage,
        contribution: tierCommission
      });
      
      remainingSales -= tierSales;
      previousThreshold = threshold;
      
      if (remainingSales <= 0) break;
    }
    
    // If we still have remaining sales, apply the highest tier
    if (remainingSales > 0 && sortedTiers.length > 0) {
      const highestTier = sortedTiers[sortedTiers.length - 1];
      const tierCommission = (remainingSales * highestTier.percentage) / 100;
      commission += tierCommission;
      
      tierContributions.push({
        tierName: highestTier.name || 'Highest Tier',
        amount: remainingSales,
        percentage: highestTier.percentage,
        contribution: tierCommission
      });
    }
    
    return { commission, tierContributions };
  }
}
