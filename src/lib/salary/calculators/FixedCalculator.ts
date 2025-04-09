
import { BaseCalculator, CalculationParams, CalculatorResult } from './BaseCalculator';
import { SalaryDetail, SalaryCalculationResult } from '../types/salary';

export class FixedCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);
      
      // Parse the plan configuration
      const config = this.parseConfig(params.plan.config);
      console.log(`Calculating fixed salary for ${params.employee.name} with plan ID ${params.plan.id}`, {
        planType: params.plan.type,
        config
      });
      
      // Extract the fixed amount from blocks if available
      let baseSalary = 0;
      if (config.blocks && Array.isArray(config.blocks)) {
        // Search for fixed_amount block
        for (const block of config.blocks) {
          if (block.type === 'fixed_amount' && block.config && block.config.amount) {
            baseSalary = Number(block.config.amount);
            console.log(`Found fixed_amount in block: ${baseSalary}`);
            break;
          }
          
          // Also check for basic_salary block (legacy format)
          if ((block.type === 'basic_salary' || block.type === 'fixed') && block.config) {
            const blockAmount = Number(
              block.config.amount || 
              block.config.base_salary || 
              block.config.base_amount ||
              block.amount || 
              0
            );
            
            if (blockAmount > 0) {
              baseSalary = blockAmount;
              console.log(`Found fixed salary in legacy block: ${baseSalary}`);
              break;
            }
          }
        }
      }
      
      // If no fixed amount found, check other possible config structures
      if (baseSalary === 0) {
        // Try various property names for backward compatibility
        baseSalary = Number(
          config.base_salary || 
          config.base_amount || 
          config.amount || 
          config.salary || 
          config.fixed_amount ||
          0
        );
        
        console.log(`Direct config properties found base salary: ${baseSalary}`);
      }
      
      // Fallback to at least some amount if we couldn't find it
      if (baseSalary === 0) {
        console.warn(`Could not find valid fixed salary amount for ${params.employee.name}. Check salary plan configuration.`);
      }
      
      // Calculate bonus, deductions, and loans
      const bonusTotal = params.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
      const deductionsTotal = params.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      const loansTotal = params.loans.reduce((sum, loan) => sum + loan.amount, 0);
      
      // Calculate total salary
      const total = baseSalary + bonusTotal - deductionsTotal - loansTotal;
      
      console.log(`Final salary calculation for ${params.employee.name}:`, {
        baseSalary,
        bonusTotal,
        deductionsTotal,
        loansTotal,
        total
      });
      
      return {
        baseSalary,
        commission: 0,
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
    return [
      {
        type: 'Base Salary',
        amount: result.baseSalary || 0,
        description: 'Fixed monthly salary'
      }
    ];
  }
}
