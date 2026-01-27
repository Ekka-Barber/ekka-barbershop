// Advanced Salary Calculation Library - Main Entry Point
// Migrated from fixes/lib/salary/ for Phase 3 integration

export * from './types/salary';
export * from './calculators/CalculatorFactory';
export * from './calculators/BaseCalculator';
export * from './calculators/FixedCalculator';
export * from './calculators/CommissionCalculator';
export * from './calculators/TieredCommissionCalculator';

export * from './hooks/useCalculator';
export * from './utils/calculatorUtils';

// Version and metadata
export const SALARY_ENGINE_VERSION = '3.0.0';
export const SALARY_ENGINE_NAME = 'Advanced Salary Calculator';

// Default export for easy importing
export { SalaryCalculatorFactory } from './calculators/CalculatorFactory';
export { useCalculator } from './hooks/useCalculator';
