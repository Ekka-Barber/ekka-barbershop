import {
  Filter,
  Search,
  X,
  RotateCcw,
  Menu,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

import type { DocumentFilters as DocumentFiltersType, Employee } from '../types';

interface DocumentFiltersProps {
  filters: DocumentFiltersType;
  searchTerm: string;
  employees: Employee[];
  onEmployeeFilterChange: (employeeId: string) => void;
  onDocumentTypeFilterChange: (documentType: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onClearAllFilters: () => void;
  onRemoveFilter: (filterKey: string) => void;
}

const documentTypeOptions = [
  { value: 'health_certificate', label: 'Health Certificate' },
  { value: 'residency_permit', label: 'Residency Permit' },
  { value: 'work_license', label: 'Work License' },
  { value: 'custom', label: 'Custom Document' },
];

const statusOptions = [
  { value: 'valid', label: 'Valid', color: 'bg-success/15 text-success' },
  {
    value: 'expiring_soon',
    label: 'Expiring Soon',
    color: 'bg-warning/15 text-warning',
  },
  {
    value: 'expired',
    label: 'Expired',
    color: 'bg-destructive/15 text-destructive',
  },
  {
    value: 'needs_renewal',
    label: 'Needs Renewal',
    color: 'bg-info/15 text-info',
  },
];

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  filters,
  searchTerm,
  employees,
  onEmployeeFilterChange,
  onDocumentTypeFilterChange,
  onStatusFilterChange,
  onSearchChange,
  onClearAllFilters,
  onRemoveFilter,
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.employeeId) count++;
    if (filters.documentType) count++;
    if (filters.status) count++;
    if (filters.issueDateFrom || filters.issueDateTo) count++;
    if (filters.expiryDateFrom || filters.expiryDateTo) count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className="h-11 w-11 p-0 sm:h-8 sm:w-auto sm:px-3"
          >
            <Menu className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">
              {isFiltersExpanded ? 'Collapse' : 'Expand'}
            </span>
            {isFiltersExpanded ? (
              <ChevronUp className="h-4 w-4 hidden sm:inline ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 hidden sm:inline ml-1" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-base sm:text-sm h-12"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1.5 h-10 w-10 p-0"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Active Filters Summary - Mobile Optimized */}
        {activeFiltersCount > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {filters.employeeId && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  Employee:{' '}
                  {employees
                    .find((e) => e.id === filters.employeeId)
                    ?.name?.slice(0, 15) || 'Unknown'}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => onRemoveFilter('employee')}
                  />
                </Badge>
              )}

              {filters.documentType && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  Type:{' '}
                  {documentTypeOptions
                    .find((t) => t.value === filters.documentType)
                    ?.label?.slice(0, 10)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => onRemoveFilter('documentType')}
                  />
                </Badge>
              )}

              {filters.status && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  Status:{' '}
                  {statusOptions
                    .find((s) => s.value === filters.status)
                    ?.label?.slice(0, 10)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => onRemoveFilter('status')}
                  />
                </Badge>
              )}

              {searchTerm && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  Search: &quot;{searchTerm.slice(0, 15)}&quot;
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => onRemoveFilter('search')}
                  />
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllFilters}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        )}

        {/* Expanded Filters - Mobile Stack Layout */}
        {isFiltersExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Employee Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Employee</Label>
              <Select
                value={filters.employeeId || 'all'}
                onValueChange={onEmployeeFilterChange}
              >
                <SelectTrigger className="text-base h-12 sm:h-10 sm:text-sm">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Type Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Document Type</Label>
              <Select
                value={filters.documentType || 'all'}
                onValueChange={onDocumentTypeFilterChange}
              >
                <SelectTrigger className="text-base h-12 sm:h-10 sm:text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {documentTypeOptions.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={onStatusFilterChange}
              >
                <SelectTrigger className="text-base h-12 sm:h-10 sm:text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${status.color}`}
                        />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
