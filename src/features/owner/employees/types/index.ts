import { TIME } from '@shared/constants/time';
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

export const DOCUMENT_TYPES = {
  health_certificate: {
    label: 'Health Certificate',
    icon: '🏥',
    defaultDuration: TIME.MONTHS_PER_YEAR,
  },
  residency_permit: {
    label: 'Residency Permit',
    icon: '🏠',
    defaultDuration: TIME.MONTHS_PER_YEAR,
  },
  work_license: {
    label: 'Work License',
    icon: '💼',
    defaultDuration: TIME.HOURS_PER_DAY,
  },
  custom: {
    label: 'Custom Document',
    icon: '📄',
    defaultDuration: TIME.MONTHS_PER_YEAR,
  },
} as const;

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
