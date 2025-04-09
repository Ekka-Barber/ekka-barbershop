import { BaseCalculator, CalculationParameters } from './BaseCalculator';
import { SalaryCalculationResult, SalaryDetail } from '../types/salary';

interface FixedSalaryConfig {
  base_salary: number;
  tiered_bonus?: Array<{
    sales_target: number;
    bonus: number;
  }>;
}

// Note: We're keeping the interface definition but using Record<string, unknown> for block configs
export class FixedCalculator extends BaseCalculator {
  async calculate(params: CalculationParameters): Promise<SalaryCalculationResult> {
    // Check cache first
    const cachedResult = this.getFromCache(params);
    if (cachedResult) {
      return cachedResult;
    }
    
    const { plan, salesAmount, bonuses = [], deductions = [], loans = [], selectedMonth } = params;
    
    // Log the month-specific data for debugging
    if (selectedMonth) {
      console.debug(`Calculating salary for month: ${selectedMonth}`);
      console.debug(`Plan type: ${plan.type}`);
      console.debug(`Bonuses count: ${bonuses.length}`);
      console.debug(`Deductions count: ${deductions.length}`);
      console.debug(`Loans count: ${loans.length}`);
    }
    
    // Parse the config - try both formats (blocks or direct config)
    const parsedConfig = this.parseConfig(plan.config);
    
    // Initialize defaults
    let baseSalary = 0;
    let commission = 0;
    let targetBonus = 0;
    const details: SalaryDetail[] = [];
    
    // Check if config has blocks structure (Original Plan format)
    if (parsedConfig.blocks && Array.isArray(parsedConfig.blocks)) {
      console.debug('Processing plan with blocks structure');
      
      // Process each block in the salary plan
      for (const block of parsedConfig.blocks) {
        if (block.type === 'basic_salary' && block.config) {
          const config = block.config as Record<string, unknown>;
          baseSalary = Number(config.base_salary) || 0;
          
          details.push({
            type: 'Base Salary',
            amount: baseSalary,
            description: 'Fixed base salary'
          });
          
          // Calculate tiered bonus if available
          if (config.tiered_bonus && Array.isArray(config.tiered_bonus)) {
            // Sort tiers by sales target (ascending)
            const sortedTiers = [...config.tiered_bonus].sort((a, b) => 
              (a.sales_target as number) - (b.sales_target as number)
            );
            
            // Find the highest tier that was reached
            for (const tier of sortedTiers) {
              if (salesAmount >= (tier.sales_target as number)) {
                targetBonus = Number(tier.bonus) || 0;
              } else {
                break;
              }
            }
            
            if (targetBonus > 0) {
              details.push({
                type: 'Performance Bonus',
                amount: targetBonus,
                description: `Bonus for reaching sales target`
              });
            }
          }
        }
        
        if (block.type === 'commission' && block.config) {
          const config = block.config as Record<string, unknown>;
          const threshold = Number(config.threshold) || 0;
          const rate = Number(config.rate) || 0;
          
          if (salesAmount > threshold) {
            const commissionableAmount = salesAmount - threshold;
            commission = commissionableAmount * rate;
            
            details.push({
              type: 'Commission',
              amount: Math.round(commission),
              description: `${(rate * 100).toFixed(1)}% on sales above ${threshold.toLocaleString()} SAR`
            });
          }
        }
      }
    } else {
      // Handle standard fixed salary format
      console.debug('Processing standard fixed salary format');
      const config = parsedConfig.config as FixedSalaryConfig || { base_salary: 0 };
      
      // Calculate base salary
      baseSalary = config.base_salary || 0;
      
      details.push({
        type: 'Base Salary',
        amount: baseSalary,
        description: 'Fixed base salary'
      });
      
      // Calculate bonus (if applicable)
      if (config.tiered_bonus && Array.isArray(config.tiered_bonus)) {
        // Sort tiers by sales target (ascending)
        const sortedTiers = [...config.tiered_bonus].sort((a, b) => 
          a.sales_target - b.sales_target
        );
        
        // Find the highest tier that was reached
        for (const tier of sortedTiers) {
          if (salesAmount >= tier.sales_target) {
            targetBonus = tier.bonus;
          } else {
            break;
          }
        }
        
        if (targetBonus > 0) {
          details.push({
            type: 'Performance Bonus',
            amount: targetBonus,
            description: `Bonus for reaching sales target`
          });
        }
      }
    }
    
    // Calculate deductions total
    const deductionsTotal = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
    
    // Calculate loans total
    const loansTotal = loans.reduce((sum, loan) => sum + loan.amount, 0);
    
    // Calculate bonus total from database
    const bonusesFromDb = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Combine all calculated values
    const result: SalaryCalculationResult = {
      baseSalary,
      commission: Math.round(commission),
      targetBonus,
      deductions: deductionsTotal,
      loans: loansTotal,
      totalSalary: baseSalary + Math.round(commission) + targetBonus + bonusesFromDb - deductionsTotal - loansTotal,
      planType: plan.type,
      planName: plan.name,
      isLoading: false,
      error: null,
      calculate: async () => {},
      calculationDone: true,
      bonusList: bonuses,
      deductionsList: deductions,
      details
    };
    
    // Save to cache and return
    this.saveToCache(params, result);
    return result;
  }
  
  generateDetails(result: Partial<SalaryCalculationResult> & { salesAmount?: number }): SalaryDetail[] {
    // This is not used directly anymore as we build the details array during calculation
    const details: SalaryDetail[] = [];
    
    if (result.baseSalary) {
      details.push({
        type: 'Base Salary',
        amount: result.baseSalary,
        description: 'Fixed base salary'
      });
    }
    
    if (result.targetBonus && result.targetBonus > 0) {
      details.push({
        type: 'Performance Bonus',
        amount: result.targetBonus,
        description: `For reaching sales target`
      });
    }
    
    return details;
  }
} 
