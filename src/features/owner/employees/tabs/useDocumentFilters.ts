import { useState, useCallback } from 'react';

import type { DocumentFilters, Employee } from '../../types';

export const useDocumentFilters = (_employees: Employee[]) => {
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.employeeId) count++;
    if (filters.documentType) count++;
    if (filters.status) count++;
    if (filters.issueDateFrom || filters.issueDateTo) count++;
    if (filters.expiryDateFrom || filters.expiryDateTo) count++;
    if (searchTerm) count++;
    return count;
  }, [filters, searchTerm]);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);

  const removeFilter = useCallback(
    (filterKey: string) => {
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
          setSearchTerm('');
          return;
      }
      setFilters(newFilters);
    },
    [filters]
  );

  const handleEmployeeFilterChange = useCallback((employeeId: string) => {
    setFilters((prev) => ({
      ...prev,
      employeeId: employeeId === 'all' ? undefined : employeeId,
    }));
  }, []);

  const handleDocumentTypeFilterChange = useCallback((documentType: string) => {
    setFilters((prev) => ({
      ...prev,
      documentType: documentType === 'all' ? undefined : documentType,
    }));
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === 'all' ? undefined : status,
    }));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    filters,
    searchTerm,
    setFilters,
    setSearchTerm,
    getActiveFiltersCount,
    clearAllFilters,
    removeFilter,
    handleEmployeeFilterChange,
    handleDocumentTypeFilterChange,
    handleStatusFilterChange,
    handleSearchChange,
  };
};
