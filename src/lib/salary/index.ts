
// Export types with explicit 'export type'
export type { 
  SalaryPlanType,
  SalaryPlan,
  SalaryBlock,
  EmployeeBonus,
  EmployeeDeduction,
  EmployeeSales,
  EmployeeLoan,
  SalaryCalculationResult,
  SalaryDetail,
  Transaction
} from './types/salary';

// Base calculator exports - using 'export type' for all types
export { SalaryCalculator } from './calculators/BaseCalculator';
export type { 
  BaseCalculator, 
  CalculationParams, 
  CalculatorResult, 
  SalesData,
  Transaction as BaseTransaction // Export Transaction from BaseCalculator with alias
} from './calculators/BaseCalculator';

// Export calculator implementations
export * from './calculators/CalculatorFactory';
export * from './calculators/FixedCalculator';
export * from './calculators/CommissionCalculator';
export * from './calculators/TieredCommissionCalculator';

// Export hooks
export * from './hooks/useSalaryCalculation';
