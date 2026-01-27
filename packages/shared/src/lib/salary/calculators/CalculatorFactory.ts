import { logger } from '@shared/utils/logger';

import { SalaryPlanType } from '../types/salary';

import { SalaryCalculator } from './BaseCalculator';
import { DynamicBasicCalculator } from './DynamicBasicCalculator';
import { FixedCalculator } from './FixedCalculator';

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
    this.calculators.set('dynamic_basic', new DynamicBasicCalculator());

    logger.info('Registered salary calculators:', {
      calculators: Array.from(this.calculators.keys()).join(', '),
    });
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
