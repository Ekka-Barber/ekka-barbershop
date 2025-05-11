import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import SalaryHistoryViewToggle from './SalaryHistoryViewToggle';
import SalaryHistoryDateFilter, { DateFilterOption } from './SalaryHistoryDateFilter';
import { useSalaryHistorySnapshots, SalaryHistorySnapshot } from '../hooks/useSalaryHistorySnapshots';
import { SalaryHistoryEmployeeFilter } from './SalaryHistoryEmployeeFilter';
import { SalaryHistorySnapshotsTable } from './SalaryHistorySnapshotsTable';
import { useAllActiveEmployees, SimpleEmployee } from '@/components/admin/employee-management/hooks/useAllActiveEmployees';

interface SalaryHistoryProps {
  pickerDate: Date;
}

const SalaryHistory: React.FC<SalaryHistoryProps> = ({
  pickerDate
}) => {
  const initializedRef = useRef(false);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  
  // Only use pickerDate for initial values, not for ongoing updates
  const [filterYear, setFilterYear] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string | null>(null);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  
  // Initialize values only once on component mount
  useEffect(() => {
    if (!initializedRef.current && pickerDate) {
      setFilterYear(String(pickerDate.getFullYear()));
      setFilterMonth(String(pickerDate.getMonth() + 1).padStart(2, '0'));
      initializedRef.current = true;
    }
  }, [pickerDate]);
  
  // Fetch all active employees for the filter
  const {
    employees: allActiveEmployees,
    isLoading: isLoadingAllEmployees,
    error: errorAllEmployees,
  } = useAllActiveEmployees();
  
  // Calculate filter values based solely on internal component state
  const effectiveMonthYearFilter = useMemo(() => {
    if (viewMode === 'year') {
      return filterYear ? filterYear : null;
    }
    if (filterYear && filterMonth) {
      return `${filterYear}-${filterMonth}`;
    }
    if (filterYear && !filterMonth) {
      return filterYear;
    }
    return null;
  }, [filterYear, filterMonth, viewMode]);
  
  const {
    snapshots,
    isLoading: isLoadingSnapshots,
    totalCount,
    getAvailableYears,
    getAvailableMonthsForYear,
    allSnapshots, // We need access to all snapshots for accurate counting
  } = useSalaryHistorySnapshots({
    monthYear: effectiveMonthYearFilter,
    viewMode: viewMode,
    employeeIds: selectedEmployeeIds.size > 0 ? Array.from(selectedEmployeeIds) : undefined,
  });

  // Derive relevant employees for the filter based on loaded snapshots
  const relevantEmployeesForFilter = useMemo((): SimpleEmployee[] => {
    if (isLoadingSnapshots || isLoadingAllEmployees || !snapshots || !allActiveEmployees) {
      return [];
    }
    if (snapshots.length === 0) {
      return []; // No snapshots, so no relevant employees for filtering by
    }
    const employeeIdsInSnapshots = new Set(snapshots.map(s => s.employee_id));
    return allActiveEmployees.filter(emp => employeeIdsInSnapshots.has(emp.id));
  }, [snapshots, allActiveEmployees, isLoadingSnapshots, isLoadingAllEmployees]);
  
  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Generate date filter options from available data - ensure defaults are provided when empty
  // Calculate per-month counts for accurate filtering
  const dateFilterOptions = useMemo((): DateFilterOption[] => {
    const years = getAvailableYears();

    // If no data yet, provide default options
    if (years.length === 0) {
      const currentYear = String(new Date().getFullYear());
      return [{
        year: currentYear,
        months: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
        count: 0,
        monthCounts: {}
      }];
    }
    
    return years.map(year => {
      // Get available months for this year
      const availableMonths = getAvailableMonthsForYear(year);
      
      // Calculate count per month for this year
      const monthCounts: Record<string, number> = {};
      
      // Ensure allSnapshots is available before trying to use it
      if (allSnapshots) {
        // Loop through each month and count records
        availableMonths.forEach(month => {
          const monthNumber = month.padStart(2, '0');
          const monthYearString = `${year}-${monthNumber}`;
          
          // Count snapshots for this specific month-year
          monthCounts[monthNumber] = allSnapshots.filter(
            snapshot => snapshot.month_year === monthYearString
          ).length;
        });
      }
      
      // Count total records for this year
      const yearCount = allSnapshots ? 
        allSnapshots.filter(snapshot => snapshot.month_year.startsWith(year)).length : 0;
      
      return {
        year,
        months: availableMonths,
        count: yearCount,
        monthCounts
      };
    });
  }, [getAvailableYears, getAvailableMonthsForYear, allSnapshots]);

  const handleYearSelect = (year: string | null) => {
    setFilterYear(year);
    if (!year) {
      setFilterMonth(null);
    } else if (viewMode === 'month' && !filterMonth) {
      setFilterMonth(null);
    }
  };
  
  const handleMonthSelect = (year: string, month: string | null) => {
    setFilterYear(year);
    setFilterMonth(month);
  };
  
  const headerText = useMemo(() => {
    if (filterYear) {
      if (filterMonth && viewMode === 'month') {
        const monthIndex = parseInt(filterMonth) - 1;
        const monthName = isNaN(monthIndex) ? '' : new Date(0, monthIndex).toLocaleString('default', { month: 'long' });
        return `${monthName} ${filterYear}`;
      }
      return `All of ${filterYear}`;
    }
    // When filterYear is null (cleared date filter)
    if (viewMode === 'month') {
      return "All Available Monthly History";
    }
    return "All Available Yearly History"; 
  }, [filterYear, filterMonth, viewMode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Salary History</h2>
        <div className="text-muted-foreground hidden md:block">
          View confirmed salary payments history
        </div>
        <SalaryHistoryViewToggle 
          currentView={viewMode} 
          onChange={(newViewMode) => {
            setViewMode(newViewMode);
            if (newViewMode === 'year') {
              setFilterMonth(null);
            }
          }} 
        />
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Always show the filter sidebar, regardless of data availability */}
        <div className="md:col-span-1 space-y-4">
          <SalaryHistoryDateFilter 
            dateOptions={dateFilterOptions}
            selectedYear={filterYear}
            selectedMonth={filterMonth}
            onYearSelect={handleYearSelect}
            onMonthSelect={handleMonthSelect}
            currentMonthYear={effectiveMonthYearFilter || ''}
          />
          <SalaryHistoryEmployeeFilter 
            selectedEmployeeIds={selectedEmployeeIds}
            onToggleEmployee={handleToggleEmployee}
            className="mt-4"
            employees={relevantEmployeesForFilter}
            isLoading={isLoadingSnapshots || isLoadingAllEmployees}
            error={errorAllEmployees}
          />
        </div>
        
        <div className="md:col-span-3 space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-medium">
                  Showing history for {headerText}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isLoadingSnapshots 
                    ? "Loading payment records..." 
                    : `Found ${totalCount} payment ${totalCount === 1 ? 'record' : 'records'}`}
                </p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-center">
                <Button variant="outline" size="sm" className="flex items-center gap-1" disabled={!snapshots || snapshots.length === 0}>
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Always render the table component, it will handle the empty state internally */}
          <SalaryHistorySnapshotsTable snapshots={snapshots || []} isLoading={isLoadingSnapshots} />
        </div>
      </div>
    </div>
  );
};

export default SalaryHistory; 