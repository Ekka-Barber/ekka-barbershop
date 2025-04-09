
import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { SalaryDetail } from '../types/salary';
import { logger } from '@/utils/logger';
import { 
  extractBaseSalary, 
  extractCommissionParams, 
  extractTargetBonus, 
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
      logger.info(`Calculating commission for ${params.employee.name} with plan ID ${params.plan.id}`, {
        planType: params.plan.type,
        salesAmount: params.salesAmount
      });
      
      // Extract salary components from config
      const baseSalary = extractBaseSalary(config);
      const { commissionRate, threshold } = extractCommissionParams(config);
      const targetBonus = extractTargetBonus(config);
      
      // Calculate commission
      const { commission, calculationDetails } = calculateCommission(
        params.salesAmount, 
        threshold, 
        commissionRate
      );
      
      if (commission > 0) {
        logger.info(`Calculated commission for ${params.employee.name}: ${commission} SAR`);
        logger.info(`  ${calculationDetails}`);
      } else {
        logger.info(`No commission awarded to ${params.employee.name}. ${calculationDetails}`);
      }
      
      // Calculate bonuses, deductions, and loans from transactions
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
      const details = generateSalaryDetails({ 
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
        targetBonus,
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
}
