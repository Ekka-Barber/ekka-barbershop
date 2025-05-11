import { 
  DocumentType, 
  DocumentStatus, 
  DocumentCalculation,
  EmployeeDocument,
  ArchiveStatusFilter,
  Branch
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
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;  // Make this required to match PaginationInfo
  pageSize: number;
}

export interface BranchSelectorProps {
  branches: Branch[];
  selectedBranch: string | null;
  onChange: (branchId: string | null) => void;
}

export interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

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
export interface EmployeesTabProps {
  initialBranchId?: string | null;
}

export interface MonthlySalesTabProps {
  initialDate?: Date;
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

// Document Tracking Types
export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired';

export type DocumentType = 'health_certificate' | 'residency_permit' | 'work_license' | 'custom';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  issueDate: string;
  expiryDate: string;
  durationMonths: number;
  status: DocumentStatus;
  notificationThresholdDays: number;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCalculation {
  daysRemaining: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  statusText: string;
  expiryDate: Date;
}

// Document Component Props
export interface DocumentsTabProps {
  employee: Employee;
}

export interface DocumentListProps {
  documents: EmployeeDocument[];
  onEdit: (document: EmployeeDocument) => void;
  onDelete: (documentId: string) => void;
  isLoading: boolean;
}

export interface DocumentFormProps {
  document?: EmployeeDocument;
  employeeId: string;
  onSubmit: (document: Partial<EmployeeDocument>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  daysRemaining?: number;
}

export interface ExpiryWarningBannerProps {
  documents: EmployeeDocument[];
}

export interface AddDocumentButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// Document Context Types
export interface DocumentContextType {
  documents: DocumentType[];
  isLoading: boolean;
  error: Error | null;
  fetchDocuments: (employeeId: string) => Promise<void>;
  addDocument: (document: Partial<DocumentType>) => Promise<void>;
  updateDocument: (id: string, document: Partial<DocumentType>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  calculateStatus: (document: DocumentType) => DocumentCalculation;
}

// Document Hook Types
export interface UseEmployeeDocumentsReturn {
  documents: DocumentType[];
  isLoading: boolean;
  error: Error | null;
  fetchDocuments: (employeeId: string) => Promise<void>;
  addDocument: (document: Partial<DocumentType>) => Promise<void>;
  updateDocument: (id: string, document: Partial<DocumentType>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  expiringSoonDocuments: DocumentType[];
  expiredDocuments: DocumentType[];
}

// Re-export types from types/index.ts to avoid duplication
export type { 
  DocumentType, 
  DocumentStatus, 
  DocumentCalculation,
  EmployeeDocument,
  ArchiveStatusFilter,
  Branch
} from './types/index';
