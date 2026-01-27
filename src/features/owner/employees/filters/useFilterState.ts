import { useState } from 'react';

import type { DocumentFilters } from '../utils/filterUtils';

interface UseFilterStateProps {
  initialFilters?: DocumentFilters;
}

export const useFilterState = ({
  initialFilters = {},
}: UseFilterStateProps = {}) => {
  const [filters, setFilters] = useState<DocumentFilters>(initialFilters);
  const [dateRangeOpen, setDateRangeOpen] = useState<'issue' | 'expiry' | null>(
    null
  );

  const updateFilters = (newFilters: DocumentFilters) => {
    setFilters(newFilters);
  };

  const updateFilter = (
    key: keyof DocumentFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const openDateRange = (type: 'issue' | 'expiry') => {
    setDateRangeOpen(type);
  };

  const closeDateRange = () => {
    setDateRangeOpen(null);
  };

  return {
    filters,
    dateRangeOpen,
    updateFilters,
    updateFilter,
    clearFilters,
    openDateRange,
    closeDateRange,
  };
};
