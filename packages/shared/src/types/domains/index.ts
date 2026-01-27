/**
 * Domain-Specific Database Type Exports
 *
 * This file provides selective imports from the monolithic database.types.ts
 * to improve bundle size and maintainability.
 *
 * Benefits:
 * - Reduced bundle size through selective imports
 * - Better code organization by business domain
 * - Easier maintenance and type discovery
 * - Faster TypeScript compilation
 */

import type { Database } from '@shared/types/database.types';

// ============================================================================
// EMPLOYEE DOMAIN TYPES
// ============================================================================

// Re-export all Employee-related types from the dedicated module
export type {
  Employee,
  EmployeeInsert,
  EmployeeUpdate,
  EmployeeBonus,
  EmployeeBonusInsert,
  EmployeeBonusUpdate,
  EmployeeDeduction,
  EmployeeDeductionInsert,
  EmployeeDeductionUpdate,
  EmployeeLoan,
  EmployeeLoanInsert,
  EmployeeLoanUpdate,
  EmployeeDocument,
  EmployeeDocumentInsert,
  EmployeeDocumentUpdate,
  EmployeeSales,
  EmployeeSalesInsert,
  EmployeeSalesUpdate,
  EmployeeHoliday,
  EmployeeHolidayInsert,
  EmployeeHolidayUpdate,
  EmployeeDocumentWithStatus,
} from './employees';

// ============================================================================
// SPONSOR DOMAIN TYPES
// ============================================================================

export type Sponsor = {
  id: string;
  name_ar: string;
  cr_number: string;
  unified_number: string;
  created_at: string;
  updated_at: string;
};

export type SponsorInsert = {
  id?: string;
  name_ar: string;
  cr_number: string;
  unified_number: string;
  created_at?: string;
  updated_at?: string;
};

export type SponsorUpdate = {
  id?: string;
  name_ar?: string;
  cr_number?: string;
  unified_number?: string;
  created_at?: string;
  updated_at?: string;
};

// ============================================================================
// BRANCH DOMAIN TYPES
// ============================================================================

export type Branch = Database['public']['Tables']['branches']['Row'];
export type BranchInsert = Database['public']['Tables']['branches']['Insert'];
export type BranchUpdate = Database['public']['Tables']['branches']['Update'];

export type BranchManager =
  Database['public']['Tables']['branch_managers']['Row'];
export type BranchManagerInsert =
  Database['public']['Tables']['branch_managers']['Insert'];
export type BranchManagerUpdate =
  Database['public']['Tables']['branch_managers']['Update'];

// ============================================================================
// SALARY DOMAIN TYPES
// ============================================================================

export type SalaryPlan = Database['public']['Tables']['salary_plans']['Row'];
export type SalaryPlanInsert =
  Database['public']['Tables']['salary_plans']['Insert'];
export type SalaryPlanUpdate =
  Database['public']['Tables']['salary_plans']['Update'];

// ============================================================================
// TRANSACTION DOMAIN TYPES
// ============================================================================

// ============================================================================
// MARKETING DOMAIN TYPES
// ============================================================================

export type MarketingCategory = 'menu' | 'offers';

export type LoanSource = 'cash_deposit' | 'other';

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Re-export core types needed for external data validation
export type { Json } from '@shared/lib/supabase/types';

// Export database type for advanced use cases
export type { Database } from '@shared/types/database.types';
