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

// Export types for use in other files
export type {
  EmployeeFilters,
  TransactionFilters,
  ExpenseFilters,
  SalesFilters,
  PayrollFilters,
};
