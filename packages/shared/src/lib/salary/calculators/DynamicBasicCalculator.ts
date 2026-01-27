import { logger } from '@shared/utils/logger';

import { SalaryDetail } from '../types/salary';

import {
  BaseCalculator,
  CalculationParams,
  CalculatorResult,
} from './BaseCalculator';

interface TieredBonus {
  bonus: number;
  sales_target: number;
}

interface BasicSalaryBlock {
  id: string;
  type: 'basic_salary';
  config: {
    base_salary: number;
    tiered_bonus?: TieredBonus[];
  };
}

interface CommissionBlock {
  id: string;
  type: 'commission';
  config: {
    rate: number;
    threshold: number;
  };
}

type ConfigBlock = BasicSalaryBlock | CommissionBlock;

interface DynamicBasicConfig {
  name: string;
  blocks: ConfigBlock[];
  description: string;
}

export class DynamicBasicCalculator extends BaseCalculator {
  async calculate(params: CalculationParams): Promise<CalculatorResult> {
    try {
      // Validate input parameters
      this.validateInput(params);

      // Parse the plan configuration
      const config = this.parseConfig(
        params.plan.config
      ) as unknown as DynamicBasicConfig;
      logger.info(
        `Calculating dynamic basic salary for ${params.employee.name} with plan ID ${params.plan.id}`,
        {
          planType: params.plan.type,
          config,
          salesAmount: params.salesAmount,
        }
      );

      let baseSalary = 0;
      let commission = 0;
      let targetBonus = 0;
      const details: SalaryDetail[] = [];

      // Process each block in the configuration
      for (const block of config.blocks || []) {
        if (block.type === 'basic_salary') {
          baseSalary = block.config.base_salary;
          details.push({
            type: 'base_salary',
            amount: baseSalary,
            description: `Fixed monthly base salary`,
          });

          // Calculate tiered bonuses based on sales
          if (block.config.tiered_bonus && params.salesAmount > 0) {
            // Find the highest bonus tier that the sales amount qualifies for
            const qualifyingBonuses = block.config.tiered_bonus
              .filter((tier) => params.salesAmount >= tier.sales_target)
              .sort((a, b) => b.sales_target - a.sales_target); // Sort by target descending

            if (qualifyingBonuses.length > 0) {
              targetBonus = qualifyingBonuses[0].bonus;
              details.push({
                type: 'target_bonus',
                amount: targetBonus,
                description: `Bonus for reaching ${qualifyingBonuses[0].sales_target.toLocaleString()} SAR sales target`,
              });
            }
          }
        } else if (block.type === 'commission') {
          // Calculate commission if sales exceed threshold
          if (params.salesAmount > block.config.threshold) {
            commission =
              (params.salesAmount - block.config.threshold) * block.config.rate;
            details.push({
              type: 'commission',
              amount: commission,
              description: `${(block.config.rate * 100).toFixed(1)}% commission on sales above ${block.config.threshold.toLocaleString()} SAR`,
            });
          }
        }
      }

      // Calculate bonus, deductions, and loans from transactions
      const bonusTotal = params.bonuses.reduce(
        (sum, bonus) => sum + bonus.amount,
        0
      );
      const deductionsTotal = params.deductions.reduce(
        (sum, deduction) => sum + deduction.amount,
        0
      );
      const loansTotal = params.loans.reduce(
        (sum, loan) => sum + loan.amount,
        0
      );

      // Add transaction details
      if (bonusTotal > 0) {
        details.push({
          type: 'additional_bonuses',
          amount: bonusTotal,
          description: `${params.bonuses.length} bonus transaction(s)`,
        });
      }

      if (deductionsTotal > 0) {
        details.push({
          type: 'deductions',
          amount: -deductionsTotal,
          description: `${params.deductions.length} deduction(s)`,
        });
      }

      if (loansTotal > 0) {
        details.push({
          type: 'loan_repayments',
          amount: -loansTotal,
          description: `${params.loans.length} loan repayment(s)`,
        });
      }

      // Calculate total salary
      const total =
        baseSalary +
        commission +
        targetBonus +
        bonusTotal -
        deductionsTotal -
        loansTotal;

      logger.info(
        `Final dynamic basic salary calculation for ${params.employee.name}:`,
        {
          baseSalary,
          commission,
          targetBonus,
          bonusTotal,
          deductionsTotal,
          loansTotal,
          total,
        }
      );

      return {
        baseSalary,
        commission,
        targetBonus,
        bonus: bonusTotal,
        deductions: deductionsTotal,
        loans: loansTotal,
        total,
        planType: 'dynamic_basic',
        planName: config.name || params.plan.name,
        details,
        calculationStatus: {
          success: true,
        },
      };
    } catch (error) {
      return this.handleCalculationError(error, params);
    }
  }
}
