
// Export calculator components
export { CalculatorFactory } from './calculators/CalculatorFactory';
export { BaseCalculator } from './calculators/BaseCalculator';
export { CommissionCalculator } from './calculators/CommissionCalculator';
export { FixedCalculator } from './calculators/FixedCalculator';
export { TieredCommissionCalculator } from './calculators/TieredCommissionCalculator';

// Export hooks
export { useCalculator } from './hooks/useCalculator';
export { useSalaryCalculation } from './hooks/useSalaryCalculation';
export { useSalaryPlanQuery } from './hooks/useSalaryPlanQuery';
export { useEmployeeTransactionQueries } from './hooks/useEmployeeTransactionQueries';

// Export utility functions
export { getLastDayOfMonth } from './hooks/utils/getLastDayOfMonth';

// Export types
// Change to export type syntax for re-exporting types to avoid TS1205 error
export type { SalaryCalculationResult, SalaryPlan } from './hooks/utils/types';
export type { SalesData } from './calculators/BaseCalculator';
export type { EmployeeSalaryCalculation, SalaryPlanQueryData } from './hooks/useSalaryCalculation';
export type { Transaction } from './types/salary';
