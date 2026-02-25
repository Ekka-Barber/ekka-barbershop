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

export type SponsorDocumentType = Database['public']['Tables']['sponsor_document_types']['Row'];
export type SponsorDocumentTypeInsert = Database['public']['Tables']['sponsor_document_types']['Insert'];
export type SponsorDocumentTypeUpdate = Database['public']['Tables']['sponsor_document_types']['Update'];

export type SponsorDocument = Database['public']['Tables']['sponsor_documents']['Row'];
export type SponsorDocumentInsert = Database['public']['Tables']['sponsor_documents']['Insert'];
export type SponsorDocumentUpdate = Database['public']['Tables']['sponsor_documents']['Update'];

export interface SponsorDocumentWithType extends SponsorDocument {
  document_type: SponsorDocumentType;
}

export interface SponsorDocumentWithStatus extends SponsorDocumentWithType {
  days_remaining: number | null;
  status: 'valid' | 'expiring_soon' | 'expired';
}

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

// ============================================================================
// INSURANCE DOMAIN TYPES
// ============================================================================

export type InsuranceCompany = Database['public']['Tables']['insurance_companies']['Row'];
export type InsuranceCompanyInsert = Database['public']['Tables']['insurance_companies']['Insert'];
export type InsuranceCompanyUpdate = Database['public']['Tables']['insurance_companies']['Update'];

export type InsuranceHospital = Database['public']['Tables']['insurance_hospitals']['Row'];
export type InsuranceHospitalInsert = Database['public']['Tables']['insurance_hospitals']['Insert'];
export type InsuranceHospitalUpdate = Database['public']['Tables']['insurance_hospitals']['Update'];

export type EmployeeInsurance = Database['public']['Tables']['employee_insurance']['Row'];
export type EmployeeInsuranceInsert = Database['public']['Tables']['employee_insurance']['Insert'];
export type EmployeeInsuranceUpdate = Database['public']['Tables']['employee_insurance']['Update'];

export interface EmployeeInsuranceWithCompany extends EmployeeInsurance {
  company: InsuranceCompany;
}

export interface InsuranceHospitalWithCompany extends InsuranceHospital {
  company: InsuranceCompany;
}

// ============================================================================
// TRANSACTION DOMAIN TYPES
// ============================================================================

// ============================================================================
// MARKETING DOMAIN TYPES
// ============================================================================

export type MarketingCategory = 'menu' | 'offers';

export type LoanSource = 'cash_deposit' | 'other';

// ============================================================================
// ACCESS USER DOMAIN TYPES
// ============================================================================

export type AccessRole = 'owner' | 'manager' | 'super_manager' | 'hr';

export interface AccessUser {
  id: string;
  name: string;
  role: AccessRole;
  branch_id: string | null;
  branch_name: string | null;
  is_super_manager: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerAccessUser extends AccessUser {
  role: 'owner';
  branch_id: null;
  branch_name: null;
  is_super_manager: false;
}

export interface ManagerAccessUser extends AccessUser {
  role: 'manager' | 'super_manager';
  branch_id: string | null;
  branch_name: string | null;
  is_super_manager: boolean;
}

export interface HRAccessUser extends AccessUser {
  role: 'hr';
  branch_id: null;
  branch_name: null;
  is_super_manager: false;
}

export interface CreateAccessUserInput {
  name: string;
  role: AccessRole;
  branch_id?: string | null;
  is_super_manager?: boolean;
  access_code: string;
}

export interface UpdateAccessUserInput {
  name?: string;
  branch_id?: string | null;
}

export interface UpdateAccessCodeInput {
  new_code: string;
}

export interface CanDeleteOwnerResult {
  can_delete: boolean;
  reason: string | null;
}

export interface DeleteOwnerResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Re-export core types needed for external data validation
export type { Json } from '@shared/lib/supabase/types';

// Export database type for advanced use cases
export type { Database } from '@shared/types/database.types';
