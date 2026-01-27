import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

import {
  SearchBar,
  ActiveFiltersSummary,
  FilterControls,
  DateRangePicker,
  getActiveFiltersCount,
  removeFilter,
  clearAllFilters,
  getEmployeeName,
  documentTypeOptions,
  statusOptions,
} from '../filters';
import type { DocumentFilters, Employee } from '../types';

interface AdvancedFiltersProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  employees: Employee[];
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  employees,
  searchTerm,
  onSearchChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRangeOpen, setDateRangeOpen] = useState<'issue' | 'expiry' | null>(
    null
  );

  const activeFiltersCount = getActiveFiltersCount(filters, searchTerm);

  const handleClearAllFilters = () => {
    clearAllFilters(onFiltersChange, onSearchChange);
  };

  const handleRemoveFilter = (filterKey: string) => {
    removeFilter(filters, filterKey, onFiltersChange, onSearchChange);
  };

  const handleEmployeeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      employeeId: value === 'all' ? undefined : value,
    });
  };

  const handleDocumentTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      documentType: value === 'all' ? undefined : value,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : value,
    });
  };

  const handleIssueDateChange = (from?: string, to?: string) => {
    onFiltersChange({
      ...filters,
      issueDateFrom: from,
      issueDateTo: to,
    });
  };

  const handleExpiryDateChange = (from?: string, to?: string) => {
    onFiltersChange({
      ...filters,
      expiryDateFrom: from,
      expiryDateTo: to,
    });
  };

  // Prepare active filters for the summary component
  const activeFilters = [
    filters.employeeId && {
      key: 'employee',
      label: `Employee: ${getEmployeeName(filters.employeeId, employees)}`,
      onRemove: () => handleRemoveFilter('employee'),
    },
    filters.documentType && {
      key: 'documentType',
      label: `Type: ${documentTypeOptions.find((t) => t.value === filters.documentType)?.label}`,
      onRemove: () => handleRemoveFilter('documentType'),
    },
    filters.status && {
      key: 'status',
      label: `Status: ${statusOptions.find((s) => s.value === filters.status)?.label}`,
      onRemove: () => handleRemoveFilter('status'),
    },
    (filters.issueDateFrom || filters.issueDateTo) && {
      key: 'issueDate',
      label: 'Issue Date Range',
      onRemove: () => handleRemoveFilter('issueDate'),
    },
    (filters.expiryDateFrom || filters.expiryDateTo) && {
      key: 'expiryDate',
      label: 'Expiry Date Range',
      onRemove: () => handleRemoveFilter('expiryDate'),
    },
    searchTerm && {
      key: 'search',
      label: `Search: "${searchTerm}"`,
      onRemove: () => handleRemoveFilter('search'),
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onRemove: () => void;
  }>;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          placeholder="Search by document name, number, or employee..."
        />

        {/* Active Filters Summary */}
        <ActiveFiltersSummary
          filters={activeFilters}
          onClearAll={handleClearAllFilters}
        />

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <FilterControls
              employeeId={filters.employeeId || 'all'}
              employees={employees}
              documentType={filters.documentType || 'all'}
              documentTypeOptions={documentTypeOptions}
              status={filters.status || 'all'}
              statusOptions={statusOptions}
              onEmployeeChange={handleEmployeeChange}
              onDocumentTypeChange={handleDocumentTypeChange}
              onStatusChange={handleStatusChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateRangePicker
                label="Issue Date Range"
                startDate={filters.issueDateFrom}
                endDate={filters.issueDateTo}
                onStartDateChange={(date) =>
                  handleIssueDateChange(date, filters.issueDateTo)
                }
                onEndDateChange={(date) =>
                  handleIssueDateChange(filters.issueDateFrom, date)
                }
                onClear={() => handleIssueDateChange(undefined, undefined)}
                isOpen={dateRangeOpen === 'issue'}
                onOpenChange={(open) => setDateRangeOpen(open ? 'issue' : null)}
              />

              <DateRangePicker
                label="Expiry Date Range"
                startDate={filters.expiryDateFrom}
                endDate={filters.expiryDateTo}
                onStartDateChange={(date) =>
                  handleExpiryDateChange(date, filters.expiryDateTo)
                }
                onEndDateChange={(date) =>
                  handleExpiryDateChange(filters.expiryDateFrom, date)
                }
                onClear={() => handleExpiryDateChange(undefined, undefined)}
                isOpen={dateRangeOpen === 'expiry'}
                onOpenChange={(open) =>
                  setDateRangeOpen(open ? 'expiry' : null)
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
