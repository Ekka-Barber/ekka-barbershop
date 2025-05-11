
import { 
  Branch,
  ArchiveStatusFilter,
  PaginationState
} from './types/index';

// Use type imports for document types to avoid conflicts
import type { 
  DocumentType,
  DocumentStatus,
  DocumentCalculation,
  EmployeeDocument
} from './types/index';

// Employee Types
export interface Employee {
  id: string;
  name: string;
  profilePicture?: string;
  role: string;
  branchId: string;
  email?: string;
  phone?: string;
  schedule?: WeeklySchedule;
  hireDate?: string;
  // Other employee properties as needed
}

export interface WeeklySchedule {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// Context Types
export interface EmployeeContextType {
  employees: Employee[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationState;
  setCurrentPage: (page: number) => void;
  filterByBranch: (branchId: string | null) => void;
  selectedBranch: string | null;
  branches: Branch[];
  // Other employee-related context functions
}

export interface SalesContextType {
  salesInputs: Record<string, number>;
  lastUpdated: string | null;
  isSubmitting: boolean;
  handleSalesChange: (employeeId: string, value: number) => void;
  submitSalesData: () => Promise<void>;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

// Component Props Types
// Ensure PaginationState matches PaginationInfo requirements
export type { PaginationState } from './types/index';

export interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string | null;
  onChange: (branchId: string | null) => void;
}

export type { EmployeeListProps } from './types/index';

export interface EmployeeCardProps {
  employee: Employee;
}

export interface EmployeeInfoTabProps {
  employee: Employee;
}

export interface EmployeeStatsTabProps {
  employee: Employee;
}

export interface EmployeeScheduleTabProps {
  employee: Employee;
}

export interface EmployeeCardActionsProps {
  employee: Employee;
}

export interface BranchBadgeProps {
  branchId: string;
}

// Monthly Sales Components Props
export interface SalesHeaderProps {
  title: string;
  description: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  lastUpdated: string | null;
}

export interface SalesGridProps {
  employees: Employee[];
  salesInputs: Record<string, number>;
  onSalesChange: (employeeId: string, value: number) => void;
  selectedDate: Date;
}

export interface SalesInputCardProps {
  employee: Employee;
  salesValue: number;
  onChange: (value: number) => void;
  selectedDate: Date;
}

export interface MonthYearPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

// Tab Props
export type { EmployeesTabProps } from './types/index';

export interface MonthlySalesTabProps {
  initialDate?: Date;
  initialBranchId?: string;
}

// Hook Return Types
export interface UseEmployeeManagerReturn {
  employees: Employee[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationState;
  setCurrentPage: (page: number) => void;
  // Other employee manager functions
}

export interface UseBranchFilterReturn {
  selectedBranch: string | null;
  branches: Branch[];
  handleBranchChange: (branchId: string | null) => void;
  // Other branch filter functions
}

export interface UseEmployeeSalesReturn {
  salesInputs: Record<string, number>;
  lastUpdated: string | null;
  isSubmitting: boolean;
  handleSalesChange: (employeeId: string, value: number) => void;
  submitSalesData: () => Promise<void>;
  // Other sales functions
}

// Tab Navigation
export interface TabsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// PaginationInfo interface should ensure totalItems is required
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

// Re-export types from types/index.ts to avoid duplication
export type {
  Branch,
  ArchiveStatusFilter,
  Employee as EmployeeType
} from './types/index';

// Document specific types are now imported from types/index.ts
export type {
  DocumentType,
  DocumentStatus,
  DocumentCalculation,
  EmployeeDocument
} from './types/index';
