// Query key factory for consistent and typed query keys
export const queryKeys = {
  all: ['app'] as const,

  // Auth queries
  auth: () => [...queryKeys.all, 'auth'] as const,
  authUser: () => [...queryKeys.auth(), 'user'] as const,

  // Branch queries
  branches: () => [...queryKeys.all, 'branches'] as const,
  branch: (id: string) => [...queryKeys.branches(), 'detail', id] as const,

  // Employee queries
  employees: (filters?: EmployeeFilters) =>
    [...queryKeys.all, 'employees', filters] as const,
  employee: (id: string) =>
    [...queryKeys.all, 'employees', 'detail', id] as const,
  employeeSales: (id: string, filters?: SalesFilters) =>
    [...queryKeys.employee(id), 'sales', filters] as const,

  // Payroll queries
  payroll: (filters: PayrollFilters) =>
    [...queryKeys.all, 'payroll', filters] as const,

  // Transaction queries
  transactions: (filters?: TransactionFilters) =>
    [...queryKeys.all, 'transactions', filters] as const,
  transaction: (id: string) =>
    [...queryKeys.all, 'transactions', 'detail', id] as const,

  // Expense queries
  expenses: (filters?: ExpenseFilters) =>
    [...queryKeys.all, 'expenses', filters] as const,
  expense: (id: string) =>
    [...queryKeys.all, 'expenses', 'detail', id] as const,
  expenseCategories: () => [...queryKeys.all, 'expense-categories'] as const,

  // Sales queries
  sales: (filters?: SalesFilters) =>
    [...queryKeys.all, 'sales', filters] as const,
  dailySales: (date: string, branchId?: string) =>
    [...queryKeys.sales(), 'daily', date, branchId] as const,

  // Dashboard queries
  dashboard: (branchId?: string) =>
    [...queryKeys.all, 'dashboard', branchId] as const,
  dashboardStats: (branchId?: string, period?: string) =>
    [...queryKeys.dashboard(branchId), 'stats', period] as const,

  // HR queries
  hr: {
    documentTypes: (includeInactive?: boolean) =>
      [...queryKeys.all, 'hr', 'document-types', includeInactive] as const,
    employees: (filters?: HREmployeeFilters) =>
      [...queryKeys.all, 'hr', 'employees', filters] as const,
    documents: (filters?: HRDocumentFilters) =>
      [...queryKeys.all, 'hr', 'documents', filters] as const,
    sponsors: (filters?: HRSponsorFilters) =>
      [...queryKeys.all, 'hr', 'sponsors', filters] as const,
    insuranceCompanies: () =>
      [...queryKeys.all, 'hr', 'insurance-companies'] as const,
    insuranceHospitals: (companyId?: string, city?: string) =>
      [...queryKeys.all, 'hr', 'insurance-hospitals', { companyId, city }] as const,
    employeeInsurance: (employeeId?: string) =>
      [...queryKeys.all, 'hr', 'employee-insurance', employeeId] as const,
    expiringInsurance: (daysThreshold?: number) =>
      [...queryKeys.all, 'hr', 'expiring-insurance', daysThreshold] as const,
    sponsorDocumentTypes: (includeInactive?: boolean) =>
      [...queryKeys.all, 'hr', 'sponsor-document-types', includeInactive] as const,
    sponsorDocuments: (filters?: HRSponsorDocumentFilters) =>
      [...queryKeys.all, 'hr', 'sponsor-documents', filters] as const,
    sponsorDocument: (id: string) =>
      [...queryKeys.all, 'hr', 'sponsor-documents', 'detail', id] as const,
    expiringSponsorDocuments: (daysThreshold?: number) =>
      [...queryKeys.all, 'hr', 'expiring-sponsor-documents', daysThreshold] as const,
  },
};

// Filter interfaces for type safety
interface EmployeeFilters {
  branchId?: string;
  role?: string;
  isArchived?: boolean;
  search?: string;
}

interface TransactionFilters {
  branchId?: string;
  type?: 'income' | 'expense';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
}

interface ExpenseFilters {
  branchId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  recurring?: boolean;
}

interface SalesFilters {
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
}

interface PayrollFilters {
  month: string;
  employeeIds?: string[];
  employeeNames?: string[];
}

// HR filter interfaces
interface HREmployeeFilters {
  search?: string;
  isArchived?: boolean;
}

interface HRDocumentFilters {
  employeeId?: string;
  status?: 'valid' | 'expiring_soon' | 'expired';
  documentType?: string;
}

interface HRSponsorFilters {
  search?: string;
}

interface HRSponsorDocumentFilters {
  sponsorId?: string;
  status?: 'valid' | 'expiring_soon' | 'expired';
  documentTypeId?: string;
}

// Export types for use in other files
export type {
  EmployeeFilters,
  TransactionFilters,
  ExpenseFilters,
  SalesFilters,
  PayrollFilters,
  HREmployeeFilters,
  HRDocumentFilters,
  HRSponsorFilters,
  HRSponsorDocumentFilters,
};
