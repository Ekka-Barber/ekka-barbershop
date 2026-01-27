import type { Employee } from '../types';
import type { DocumentFilters } from '../types';

export interface FilterOption {
  value: string;
  label: string;
  color?: string;
}

export const documentTypeOptions: FilterOption[] = [
  { value: 'health_certificate', label: 'Health Certificate' },
  { value: 'residency_permit', label: 'Residency Permit' },
  { value: 'work_license', label: 'Work License' },
  { value: 'custom', label: 'Custom Document' },
];

export const statusOptions: FilterOption[] = [
  { value: 'valid', label: 'Valid', color: 'bg-green-100 text-green-800' },
  {
    value: 'expiring_soon',
    label: 'Expiring Soon',
    color: 'bg-yellow-100 text-yellow-800',
  },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  {
    value: 'needs_renewal',
    label: 'Needs Renewal',
    color: 'bg-orange-100 text-orange-800',
  },
];

/**
 * Calculate the number of active filters
 */
export const getActiveFiltersCount = (
  filters: DocumentFilters,
  searchTerm: string
): number => {
  let count = 0;
  if (filters.employeeId) count++;
  if (filters.documentType) count++;
  if (filters.status) count++;
  if (filters.issueDateFrom || filters.issueDateTo) count++;
  if (filters.expiryDateFrom || filters.expiryDateTo) count++;
  if (searchTerm) count++;
  return count;
};

/**
 * Remove a specific filter
 */
export const removeFilter = (
  filters: DocumentFilters,
  filterKey: string,
  onFiltersChange: (filters: DocumentFilters) => void,
  onSearchChange?: (search: string) => void
): void => {
  const newFilters = { ...filters };

  switch (filterKey) {
    case 'employee':
      delete newFilters.employeeId;
      break;
    case 'documentType':
      delete newFilters.documentType;
      break;
    case 'status':
      delete newFilters.status;
      break;
    case 'issueDate':
      delete newFilters.issueDateFrom;
      delete newFilters.issueDateTo;
      break;
    case 'expiryDate':
      delete newFilters.expiryDateFrom;
      delete newFilters.expiryDateTo;
      break;
    case 'search':
      onSearchChange?.('');
      return;
  }

  onFiltersChange(newFilters);
};

/**
 * Clear all filters
 */
export const clearAllFilters = (
  onFiltersChange: (filters: DocumentFilters) => void,
  onSearchChange: (search: string) => void
): void => {
  onFiltersChange({});
  onSearchChange('');
};

/**
 * Get employee name by ID
 */
export const getEmployeeName = (
  employeeId: string,
  employees: Employee[]
): string => {
  const employee = employees.find((e) => e.id === employeeId);
  return employee?.name || 'Unknown';
};

export type { DocumentFilters } from '../types';