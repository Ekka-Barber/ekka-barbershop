/**
 * Database Table Names
 * 
 * Centralized table name constants for type safety and maintainability.
 * Prevents typos in Supabase queries and enables easier refactoring.
 */

export const TABLES = {
  BRANCHES: 'branches',
  BRANCH_MANAGERS: 'branch_managers',
  EMPLOYEES: 'employees',
  EMPLOYEE_BONUSES: 'employee_bonuses',
  EMPLOYEE_DEDUCTIONS: 'employee_deductions',
  EMPLOYEE_LOANS: 'employee_loans',
  EMPLOYEE_SALES: 'employee_sales',
  EMPLOYEE_DOCUMENTS: 'employee_documents',
  EMPLOYEE_HOLIDAYS: 'employee_holidays',
  SALARY_PLANS: 'salary_plans',
  SPONSORS: 'sponsors',
  MARKETING_FILES: 'marketing_files',
  QR_CODES: 'qr_codes',
  QR_SCANS: 'qr_scans',
  OWNER_ACCESS: 'owner_access',
  UI_ELEMENTS: 'ui_elements',
  GOOGLE_REVIEWS: 'google_reviews',
  REVIEW_AVATAR_CACHE: 'review_avatar_cache',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

/**
 * Database View Names
 */

export const VIEWS = {
  EMPLOYEE_DOCUMENTS_WITH_STATUS: 'employee_documents_with_status',
  QR_SCAN_COUNTS_DAILY: 'qr_scan_counts_daily',
} as const;

export type ViewName = typeof VIEWS[keyof typeof VIEWS];
