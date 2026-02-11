import { SalaryCalculation, EmployeeWithBranch } from '@shared/types/business';
import { Database } from '@shared/types/database.types';
import type {
  Employee,
  EmployeeDeduction,
  EmployeeLoan,
  EmployeeBonus,
} from '@shared/types/domains';

export type EmployeeDocumentWithStatus =
  Database['public']['Views']['employee_documents_with_status']['Row'];

// Re-export Employee type for components
export type { Employee, EmployeeDeduction, EmployeeLoan, EmployeeBonus };

// Re-export EmployeeWithBranch from business types
export type { EmployeeWithBranch };

export interface DocumentFilters {
  employeeId?: string;
  documentType?: string;
  status?: string;
  searchTerm?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
}

// Local component-specific types
export interface DocumentsTabProps {
  employees: Employee[];
  selectedMonth: string;
}

export interface DocumentFormData {
  employee_id: string;
  document_type: string;
  document_name: string;
  document_number?: string;
  issue_date: string;
  expiry_date: string;
  duration_months?: number;
  notification_threshold_days?: number;
  document_url?: string;
  notes?: string;
}

// NOTE: Document types are now managed dynamically via the database
// Use the useDocumentTypes hook from @features/hr/hooks/useDocumentTypes
// to fetch document types with their configurations (duration, icons, etc.)
// 
// The document_types table in Supabase contains:
// - code: unique identifier (e.g., 'health_certificate')
// - name_ar/name_en: display names
// - default_duration_months: default validity period
// - notification_threshold_days: when to alert before expiry
// - icon/color: UI theming
// - is_active: soft delete flag
//
// @deprecated Use useDocumentTypes hook and document_types table instead
export const DOCUMENT_TYPES = {} as const;

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
