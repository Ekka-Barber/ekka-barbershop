
// Export all types from salary.ts using explicit exports
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
  // Don't export Transaction from here to avoid duplication
} from './types/salary';

// Export calculators with explicit re-exports to avoid naming conflicts
export { SalaryCalculator } from './calculators/BaseCalculator';
export type { 
  BaseCalculator, 
  CalculationParams, 
  CalculatorResult, 
  SalesData,
  Transaction // Only export Transaction from BaseCalculator
} from './calculators/BaseCalculator';

// Export calculator implementations
export * from './calculators/CalculatorFactory';
export * from './calculators/FixedCalculator';
export * from './calculators/CommissionCalculator';
export * from './calculators/TieredCommissionCalculator';

// Export hooks
export * from './hooks/useSalaryCalculation';
