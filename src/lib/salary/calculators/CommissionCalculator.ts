
import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { SalaryDetail, SalaryCalculationResult } from '../types/salary';
import { logger } from '@/utils/logger';

export class CommissionCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);
      
      // Parse the plan configuration
      const config = this.parseConfig(params.plan.config);
      logger.info(`Calculating commission for ${params.employee.name} with plan ID ${params.plan.id}`, {
        planType: params.plan.type,
        salesAmount: params.salesAmount,
        config
      });
      
      // Initialize values
      let baseSalary = 0;
      let commission = 0;
      let commissionRate = 0;
      let threshold = 0;
      let targetBonus = 0; // Added target bonus value
      
      // Log the full config for debugging
      logger.debug('Full salary plan config:', JSON.stringify(config, null, 2));
      
      // Process plan based on structure
      if (config.blocks && Array.isArray(config.blocks)) {
        logger.info('Using blocks-based salary plan structure');
        // Process each block in the config
        for (const block of config.blocks) {
          logger.debug(`Processing block of type: ${block.type}`, block);
          
          // Handle base salary block
          if (block.type === 'basic_salary' && block.config) {
            // Try multiple possible property names for base salary
            baseSalary = Number(block.config.base_salary || 
                               block.config.amount || 
                               block.config.base_amount || 0);
            logger.info(`Found base salary in block: ${baseSalary}`);
          }
          
          // Handle commission block
          if (block.type === 'commission' && block.config) {
            // Extract commission rate and ensure it's a proper decimal value (e.g., 0.2 for 20%)
            commissionRate = Number(block.config.rate || block.config.commission_rate || 0);
            threshold = Number(block.config.threshold || 0);
            logger.info(`Found commission block: rate=${commissionRate}, threshold=${threshold} SAR`);
          }
          
          // Handle target bonus block
          if (block.type === 'target_bonus' && block.config) {
            targetBonus = Number(block.config.amount || block.config.bonus_amount || 0);
            logger.info(`Found target bonus in block: ${targetBonus}`);
          }
        }
      } else {
        logger.info('Using legacy/flat salary plan structure');
        // Legacy format - direct properties at the top level
        baseSalary = Number(config.base_salary || config.base_amount || config.amount || 0);
        commissionRate = Number(config.commission_rate || config.rate || 0);
        threshold = Number(config.threshold || 0);
        targetBonus = Number(config.target_bonus || config.bonus_amount || 0);
        
        logger.info(`Extracted from flat config: baseSalary=${baseSalary}, commissionRate=${commissionRate}, threshold=${threshold}, targetBonus=${targetBonus}`);
      }
      
      logger.info(`Final commission calculation values: baseSalary=${baseSalary}, commissionRate=${commissionRate}, threshold=${threshold}, targetBonus=${targetBonus}, salesAmount=${params.salesAmount}`);
      
      // Calculate commission if threshold is met or exceeded
      if (params.salesAmount >= threshold && commissionRate > 0) {
        // In some cases, the rate might be stored as a percentage (e.g., 20 instead of 0.2)
        const normalizedRate = commissionRate > 1 ? commissionRate / 100 : commissionRate;
        const commissionableAmount = params.salesAmount - threshold;
        
        // Apply normalized commission rate
        commission = Math.round(commissionableAmount * normalizedRate);
        
        logger.info(`Calculated commission for ${params.employee.name}: ${commission} SAR`);
        logger.info(`  Sales: ${params.salesAmount} SAR`);
        logger.info(`  Threshold: ${threshold} SAR`);
        logger.info(`  Commissionable Amount: ${commissionableAmount} SAR`);
        logger.info(`  Original Rate: ${commissionRate}, Normalized Rate: ${normalizedRate}`);
        logger.info(`  Formula: (${params.salesAmount} - ${threshold}) × ${normalizedRate} = ${commission} SAR`);
      } else {
        logger.info(`No commission awarded to ${params.employee.name}. Sales amount ${params.salesAmount} < threshold ${threshold} or rate ${commissionRate} is zero.`);
      }
      
      // Calculate bonus from transactions, deductions, and loans
      const regularBonusTotal = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const deductionsTotal = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const loansTotal = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
      
      // Log both bonus types
      logger.info(`Bonus calculation for ${params.employee.name}:`, {
        targetBonus,
        regularBonusTotal,
        totalBonusAmount: targetBonus + regularBonusTotal
      });
      
      // Calculate total salary
      const total = baseSalary + commission + targetBonus + regularBonusTotal - deductionsTotal - loansTotal;
      
      logger.info(`Final salary calculation for ${params.employee.name}:`, {
        baseSalary,
        commission,
        targetBonus,
        regularBonusTotal,
        deductionsTotal,
        loansTotal,
        total
      });
      
      // Generate detailed breakdown for UI
      const details = this.generateDetails({ 
        baseSalary, 
        commission, 
        targetBonus,
        regularBonusTotal,
        deductions: deductionsTotal, 
        loans: loansTotal, 
        totalSalary: total 
      });
      
      return {
        baseSalary,
        commission,
        bonus: regularBonusTotal,
        targetBonus, // Added separate targetBonus field
        deductions: deductionsTotal,
        loans: loansTotal,
        total,
        details,
        calculationStatus: {
          success: true
        }
      };
    } catch (error) {
      logger.error(`Commission calculation error for ${params.employee.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.handleCalculationError(error, params);
    }
  }
  
  generateDetails(result: { 
    baseSalary: number; 
    commission: number; 
    targetBonus: number; 
    regularBonusTotal: number;
    deductions: number;
    loans: number;
    totalSalary: number;
  }): SalaryDetail[] {
    const details: SalaryDetail[] = [];
    
    if (result.baseSalary && result.baseSalary > 0) {
      details.push({
        type: 'Base Salary',
        amount: result.baseSalary,
        description: 'Base monthly salary'
      });
    }
    
    if (result.commission && result.commission > 0) {
      details.push({
        type: 'Commission',
        amount: result.commission,
        description: 'Sales commission'
      });
    }
    
    // Add target bonus from salary plan if available
    if (result.targetBonus && result.targetBonus > 0) {
      details.push({
        type: 'Target Bonus',
        amount: result.targetBonus,
        description: 'Monthly target performance bonus from salary plan'
      });
    }
    
    // Add regular bonuses if available
    if (result.regularBonusTotal && result.regularBonusTotal > 0) {
      details.push({
        type: 'Additional Bonuses',
        amount: result.regularBonusTotal,
        description: 'Additional bonuses from transactions'
      });
    }
    
    return details;
  }
}
