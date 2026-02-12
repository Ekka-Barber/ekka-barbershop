import { SalaryCalculation, EmployeeWithBranch } from '@shared/types/business';
import type {
  Employee,
  EmployeeDeduction,
  EmployeeLoan,
  EmployeeBonus,
} from '@shared/types/domains';

// Re-export Employee type for components
export type { Employee, EmployeeDeduction, EmployeeLoan, EmployeeBonus };

// Re-export EmployeeWithBranch from business types
export type { EmployeeWithBranch };

// =============================================================================
// SALARY CALCULATION TYPES
// =============================================================================

// EmployeeLoan and EmployeeBonus are now imported from @/types/domains

export interface SalaryCalculationCardsProps {
  calculations: SalaryCalculation[];
  selectedMonth: string;
  monthlyDeductions: EmployeeDeduction[];
  monthlyLoans: EmployeeLoan[];
  monthlyBonuses: EmployeeBonus[];
  employees?: Array<{
    id: string;
    name: string;
    name_ar?: string | undefined;
    branches?: { id: string; name: string; name_ar?: string | undefined } | null;
    sponsor_id?: string | null;
    sponsors?: { name_ar?: string | undefined } | null;
  }>;
}

export interface SalaryCalculationCardProps {
  calculation: SalaryCalculation;
  selectedMonth: string;
  employeeDeductions: EmployeeDeduction[];
  employeeLoans: EmployeeLoan[];
  employeeBonuses: EmployeeBonus[];
}

export type {
  AddLeaveData,
  AddLeaveResponse,
  LeaveRecord,
  LeaveBalance,
  LeavesByEmployee,
} from './leaveTypes';

export type {
  EmployeeFinancialRecord,
  EmployeeFinancialRecords,
  SalaryData,
} from './page.types';

export type { EmployeeCardData } from '../components/EnhancedEmployeeCard.types';
