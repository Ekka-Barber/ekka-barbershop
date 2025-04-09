
import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { SalaryDetail, SalaryCalculationResult } from '../types/salary';

export class CommissionCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);
      
      // Parse the plan configuration
      const config = this.parseConfig(params.plan.config);
      console.log(`Calculating commission for ${params.employee.name} with plan ID ${params.plan.id}`, {
        planType: params.plan.type,
        salesAmount: params.salesAmount,
        config
      });
      
      // Initialize values
      let baseSalary = 0;
      let commission = 0;
      let commissionRate = 0;
      let threshold = 0;
      
      // Process plan based on structure
      if (config.blocks && Array.isArray(config.blocks)) {
        // Process each block in the config
        for (const block of config.blocks) {
          // Handle base salary block
          if (block.type === 'basic_salary' && block.config) {
            baseSalary = Number(block.config.base_salary || block.config.amount || block.config.base_amount || 0);
            console.log(`Found base salary in block: ${baseSalary}`);
          }
          
          // Handle commission block
          if (block.type === 'commission' && block.config) {
            // Extract commission rate and ensure it's a proper decimal value (e.g., 0.2 for 20%)
            commissionRate = Number(block.config.rate || 0);
            threshold = Number(block.config.threshold || 0);
            console.log(`Found commission block: rate=${commissionRate}, threshold=${threshold} SAR`);
          }
        }
      } else {
        // Legacy format - direct properties
        baseSalary = Number(config.base_salary || config.base_amount || config.amount || 0);
        commissionRate = Number(config.commission_rate || config.rate || 0);
        threshold = Number(config.threshold || 0);
      }
      
      // Calculate commission if threshold is met or exceeded
      if (params.salesAmount >= threshold && commissionRate > 0) {
        const commissionableAmount = params.salesAmount - threshold;
        
        // Ensure commissionRate is properly applied as a decimal (0.2 = 20%)
        commission = Math.round(commissionableAmount * commissionRate);
        
        console.log(`Calculated commission for ${params.employee.name}: ${commission} SAR`);
        console.log(`  Sales: ${params.salesAmount} SAR`);
        console.log(`  Threshold: ${threshold} SAR`);
        console.log(`  Commissionable Amount: ${commissionableAmount} SAR`);
        console.log(`  Rate: ${commissionRate}`);
        console.log(`  Formula: (${params.salesAmount} - ${threshold}) × ${commissionRate} = ${commission} SAR`);
      }
      
      // Calculate bonus, deductions, and loans
      const bonusTotal = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const deductionsTotal = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const loansTotal = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
      
      // Calculate total salary
      const total = baseSalary + commission + bonusTotal - deductionsTotal - loansTotal;
      
      console.log(`Final salary calculation for ${params.employee.name}:`, {
        baseSalary,
        commission,
        bonusTotal,
        deductionsTotal,
        loansTotal,
        total
      });
      
      return {
        baseSalary,
        commission,
        bonus: bonusTotal,
        deductions: deductionsTotal,
        loans: loansTotal,
        total,
        calculationStatus: {
          success: true
        }
      };
    } catch (error) {
      return this.handleCalculationError(error, params);
    }
  }
  
  generateDetails(result: Partial<SalaryCalculationResult>): SalaryDetail[] {
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
    
    return details;
  }
}
