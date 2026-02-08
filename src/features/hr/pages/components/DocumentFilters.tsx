import { Filter, Search, X } from 'lucide-react';
import React from 'react';

import type { HREmployee } from '@shared/types/hr.types';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';

export type DocumentStatusFilter = 'all' | 'valid' | 'expiring_soon' | 'expired';
export type DocumentTypeFilter = 'all' | 'health_certificate' | 'residency_permit' | 'work_license' | 'custom';

interface DocumentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: DocumentStatusFilter;
  onStatusFilterChange: (value: DocumentStatusFilter) => void;
  typeFilter: DocumentTypeFilter;
  onTypeFilterChange: (value: DocumentTypeFilter) => void;
  employeeFilter: string;
  onEmployeeFilterChange: (value: string) => void;
  employees: HREmployee[];
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const STATUS_OPTIONS: { value: DocumentStatusFilter; label: string }[] = [
  { value: 'all', label: 'جميع الحالات' },
  { value: 'valid', label: 'ساري' },
  { value: 'expiring_soon', label: 'ينتهي قريباً' },
  { value: 'expired', label: 'منتهي' },
];

const TYPE_OPTIONS: { value: DocumentTypeFilter; label: string }[] = [
  { value: 'all', label: 'جميع الأنواع' },
  { value: 'health_certificate', label: 'شهادة صحية' },
  { value: 'residency_permit', label: 'بطاقة إقامة' },
  { value: 'work_license', label: 'رخصة عمل' },
  { value: 'custom', label: 'مخصص' },
];

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  employeeFilter,
  onEmployeeFilterChange,
  employees,
  onClearFilters,
  activeFiltersCount,
}) => {
  const hasActiveFilters =
    searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || employeeFilter !== 'all';

  return (
    <Card className="border-[#e2ceab] bg-white/90 shadow-[0_8px_30px_-15px_rgba(82,60,28,0.3)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Search and Status Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-[#92734a]" />
              <Input
                placeholder="ابحث باسم المستند أو الموظف..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 border-[#dcc49c] bg-[#fffdfa] ps-10"
                dir="rtl"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => onStatusFilterChange(value as DocumentStatusFilter)}
              >
                <SelectTrigger className="h-11 w-[140px] border-[#dcc49c] bg-[#fffdfa]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={typeFilter}
                onValueChange={(value) => onTypeFilterChange(value as DocumentTypeFilter)}
              >
                <SelectTrigger className="h-11 w-[140px] border-[#dcc49c] bg-[#fffdfa]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employee Filter Row */}
          <div className="flex items-center gap-3">
            <Select
              value={employeeFilter}
              onValueChange={onEmployeeFilterChange}
            >
              <SelectTrigger className="h-11 flex-1 border-[#dcc49c] bg-[#fffdfa]">
                <SelectValue placeholder="اختر موظفاً" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name_ar || employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="h-11 px-4 border-[#e9b353] text-[#8b6914] hover:bg-[#fff8ea] whitespace-nowrap"
              >
                <X className="h-4 w-4 ms-1.5" />
                مسح الفلاتر
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="me-2 bg-[#e9b353] text-white"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#f0e2c8]">
              <span className="text-xs text-[#7a684e] flex items-center gap-1">
                <Filter className="h-3 w-3" />
                الفلاتر النشطة:
              </span>
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="text-xs border-[#dcc49c] bg-[#fffdfa]"
                >
                  بحث: {searchQuery}
                  <button
                    onClick={() => onSearchChange('')}
                    className="me-1 text-[#7a684e] hover:text-[#2f261b]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="text-xs border-[#dcc49c] bg-[#fffdfa]"
                >
                  {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                  <button
                    onClick={() => onStatusFilterChange('all')}
                    className="me-1 text-[#7a684e] hover:text-[#2f261b]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="text-xs border-[#dcc49c] bg-[#fffdfa]"
                >
                  {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
                  <button
                    onClick={() => onTypeFilterChange('all')}
                    className="me-1 text-[#7a684e] hover:text-[#2f261b]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {employeeFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="text-xs border-[#dcc49c] bg-[#fffdfa]"
                >
                  {employees.find((e) => e.id === employeeFilter)?.name_ar ||
                    employees.find((e) => e.id === employeeFilter)?.name}
                  <button
                    onClick={() => onEmployeeFilterChange('all')}
                    className="me-1 text-[#7a684e] hover:text-[#2f261b]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
