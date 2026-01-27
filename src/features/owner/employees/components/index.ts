// Employee Components - Optimized Barrel Exports
// Optimized for tree-shaking and new flattened structure

// =============================================================================
// MAIN EMPLOYEE COMPONENTS
// =============================================================================

// Core employee management components
export { DynamicInputs } from './DynamicInputs';
export { EmployeeInputs } from './EmployeeInputs';
export { EmployeePagination } from './EmployeePagination';
export { MonthSelector } from './MonthSelector';
export { EmployeeTabs } from './EmployeeTabs';

// Salary calculation components
export { SalaryCalculationCards } from './SalaryCalculationCards';
export { default as SalaryCalculationCardsDefault } from './SalaryCalculationCards';

// =============================================================================
// FLATTENED COMPONENTS (from /components directory)
// =============================================================================

// Document management components
export { EmployeeDocumentCard } from './EmployeeDocumentCard';
export { EmployeeDocumentsList } from './EmployeeDocumentsList';
export { DocumentForm } from './DocumentForm';
export { DocumentFormWithTemplates } from './DocumentFormWithTemplates';
export { DocumentTemplates } from '../templates';
export { BulkActions } from './BulkActions';
export { AdvancedFilters } from './AdvancedFilters';

// Leave management components
export { EmployeeLeaveCard } from './EmployeeLeaveCard';
export { LeaveHeader } from './LeaveHeader';
export { LeaveGrid } from './LeaveGrid';
export { AddLeaveDialog } from './AddLeaveDialog';
export { ExpiryAlert } from './ExpiryAlert';

// Loan management components
export { EmployeeLoanCard } from './EmployeeLoanCard';
export { ExistingLoansAccordion } from './ExistingLoansAccordion';
export { NewLoansAccordion } from './NewLoansAccordion';

// UI components
export { StatusBadge } from './StatusBadge';
export { LoadingSkeleton } from './LoadingSkeleton';
export { EmptyState } from './EmptyState';

// =============================================================================
// LEGACY COMPONENTS (from /tabs directory - maintaining compatibility)
// =============================================================================

// Tab components for backward compatibility
export { BonusesTab } from '../tabs/BonusesTab';
export { DeductionsTab } from '../tabs/DeductionsTab';
export { DocumentsTab } from '../tabs/DocumentsTab';
export { LoansTab } from '../tabs/LoansTab';
export { SalariesTab } from '../tabs/SalariesTab';
export { SalesTab } from '../tabs/SalesTab';

// Document tab sub-components
export { DocumentFilters } from '../tabs/DocumentFilters';
export { DocumentBulkActions } from '../tabs/DocumentBulkActions';
export { DocumentSummaryCards } from '../tabs/DocumentSummaryCards';
export { DocumentActionBar } from '../tabs/DocumentActionBar';

// =============================================================================
// OTHER STRUCTURED COMPONENTS
// =============================================================================

// Shared components
export { EditableTableRow } from '../shared/EditableTableRow';
export { RecordsTabLayout } from '../shared/RecordsTabLayout';
export { RecordsTable } from '../shared/RecordsTable';

// Input components
export { DynamicFieldInput } from '../inputs/DynamicFieldInput';
export { DynamicInputsHeader } from '../inputs/DynamicInputsHeader';
export { EmployeeCard } from '../inputs/EmployeeCard';
export { EmployeeSalesInput } from '../inputs/EmployeeSalesInput';

// Core employee card components
export { EmployeeHeader } from './EmployeeHeader';
export { QuickSummaryCards } from './QuickSummaryCards';
export { ExpandedContent } from './ExpandedContent';
export { SalaryPlanSelector } from './SalaryPlanSelector';

// Enhanced components
export { EmployeeGrid } from './EmployeeGrid';
export { EnhancedEmployeeCard } from './EnhancedEmployeeCard';

// =============================================================================
// DIRECTORY RE-EXPORTS (maintaining compatibility)
// =============================================================================

// Re-export from SalaryCalculationCards directory
export * from './SalaryCalculationCards';

// =============================================================================
// LEGACY EXPORTS (types/utilities for backward compatibility)
// =============================================================================
export * from '../types';
export * from '../utils';
