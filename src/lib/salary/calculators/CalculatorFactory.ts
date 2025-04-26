import { SalaryPlanType } from '../types/salary';
import { SalaryCalculator } from './BaseCalculator';
import { FixedCalculator } from './FixedCalculator';
import { CommissionCalculator } from './CommissionCalculator';
import { TieredCommissionCalculator } from './TieredCommissionCalculator';
import { FormulaCalculator } from './FormulaCalculator';
import { logger } from '@/utils/logger';

export class SalaryCalculatorFactory {
  private static instance: SalaryCalculatorFactory;
  private calculators: Map<SalaryPlanType, SalaryCalculator>;

  private constructor() {
    this.calculators = new Map();
    this.registerCalculators();
  }

  public static getInstance(): SalaryCalculatorFactory {
    if (!SalaryCalculatorFactory.instance) {
      SalaryCalculatorFactory.instance = new SalaryCalculatorFactory();
    }
    return SalaryCalculatorFactory.instance;
  }

  private registerCalculators(): void {
    // Register all calculator implementations
    this.calculators.set('fixed', new FixedCalculator());
    this.calculators.set('commission', new CommissionCalculator());
    this.calculators.set('tiered_commission', new TieredCommissionCalculator());
    this.calculators.set('formula', new FormulaCalculator());
    
    // Map all commission-based plan types to the CommissionCalculator
    this.calculators.set('dynamic_basic', new CommissionCalculator());
    this.calculators.set('commission_only', new CommissionCalculator());
    this.calculators.set('team_commission', new CommissionCalculator());
    
    logger.info('Registered salary calculators:', 
      Array.from(this.calculators.keys()).join(', '));
  }

  public getCalculator(planType: SalaryPlanType): SalaryCalculator {
    const calculator = this.calculators.get(planType);
    
    if (!calculator) {
      const error = `No calculator found for plan type: ${planType}`;
      logger.error(error);
      throw new Error(error);
    }
    
    logger.info(`Retrieved calculator for plan type: ${planType}`);
    return calculator;
  }
}
