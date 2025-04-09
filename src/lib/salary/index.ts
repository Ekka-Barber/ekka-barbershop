
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
  Transaction // Fix: Adding explicit export type for Transaction
} from './types/salary';

// Base calculator exports - using 'export type' for all types
export { SalaryCalculator } from './calculators/BaseCalculator';
export type { 
  BaseCalculator, 
  CalculationParams, 
  CalculatorResult, 
  SalesData
  // Removed Transaction from here to fix re-export error
} from './calculators/BaseCalculator';

// Export calculator implementations
export * from './calculators/CalculatorFactory';
export * from './calculators/FixedCalculator';
export * from './calculators/CommissionCalculator';
export * from './calculators/TieredCommissionCalculator';

// Export hooks
export * from './hooks/useSalaryCalculation';
