import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
// import { SalaryDetail } from '../types/salary'; // Removed unused import
import { logger } from '@/utils/logger';
import {
  // extractBaseSalary, // Removed unused import
  extractCommissionParams,
  calculateCommission,
  generateSalaryDetails
} from './utils/commissionUtils';

export class CommissionCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);
      
      // Parse the plan configuration
      const config = this.parseConfig(params.plan.config);
      
      let baseSalary = 0;
      let tieredBonusConfig: { bonus: number; sales_target: number }[] | undefined;
      let targetBonus = 0; // Initialize target bonus
      
      // Find basic salary block and potential tiered bonuses within it
      if (config.blocks && Array.isArray(config.blocks)) {
        for (const block of config.blocks) {
          if (block.type === 'basic_salary' && block.config) {
            baseSalary = Number(block.config.base_salary || block.config.amount || block.config.base_amount || 0);
            if (Array.isArray(block.config.tiered_bonus)) {
              tieredBonusConfig = block.config.tiered_bonus;
            }
            break; // Assuming only one basic_salary block
          }
        }
      } else {
         // Fallback for legacy flat config if needed (though tiered bonus likely won't exist here)
         baseSalary = Number(config.base_salary || config.base_amount || config.amount || 0);
         logger.warn(`Using legacy flat config for base salary for plan ${params.plan.id}`); // Keep this warning?
      }
      
      // Extract commission parameters (assuming it's in its own block or legacy)
      const { commissionRate, threshold } = extractCommissionParams(config);
      
      // Calculate commission
      const { commission /*, calculationDetails*/ } = calculateCommission(
        params.salesAmount, 
        threshold, 
        commissionRate
      );
      
      // Calculate target bonus based on tiered structure if found
      if (tieredBonusConfig) {
         // Sort tiers by sales_target descending to find the highest applicable bonus
         const sortedTiers = [...tieredBonusConfig].sort((a, b) => b.sales_target - a.sales_target);
         for (const tier of sortedTiers) {
           if (params.salesAmount >= tier.sales_target) {
             targetBonus = Number(tier.bonus || 0);
             break; // Found the highest applicable tier
           }
         }
      } // Removed logger.info call for no tiered config found
      
      // Calculate bonuses, deductions, and loans from transactions
      const regularBonusTotal = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const deductionsTotal = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const loansTotal = params.loans.reduce((sum, loan) => sum + loan.amount, 0); // Uses loans fetched for the specific month
      
      // Calculate total salary
      const total = baseSalary + commission + targetBonus + regularBonusTotal - deductionsTotal - loansTotal;
      
      // Generate detailed breakdown for UI
      const details = generateSalaryDetails({ 
        baseSalary, 
        commission, 
        targetBonus, // Pass calculated target bonus
        regularBonusTotal,
        deductions: deductionsTotal, 
        loans: loansTotal, 
        totalSalary: total 
      });
      
      return {
        baseSalary,
        commission,
        bonus: regularBonusTotal, // Regular bonus total
        targetBonus, // Target bonus based on sales
        deductions: deductionsTotal,
        loans: loansTotal,
        total,
        details,
        calculationStatus: {
          success: true
        }
      };
    } catch (error) {
      logger.error(`Commission calculation error for ${params.employee.name}: ${error instanceof Error ? error.message : 'Unknown error'}`); // Keep error log
      return this.handleCalculationError(error, params);
    }
  }
}
