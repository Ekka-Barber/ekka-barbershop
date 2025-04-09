
// Export types from salary.ts 
export * from './types/salary';

// Export calculators with explicit re-exports to avoid naming conflicts
export { 
  SalaryCalculator, 
  BaseCalculator, 
  CalculationParams, 
  CalculatorResult, // Renamed from CalculationResult
  SalesData
} from './calculators/BaseCalculator';

// Export calculator implementations
export * from './calculators/CalculatorFactory';
export * from './calculators/FixedCalculator';
export * from './calculators/CommissionCalculator';
export * from './calculators/TieredCommissionCalculator';

// Export hooks
export * from './hooks/useSalaryCalculation';
