import { useQuery } from '@tanstack/react-query';

import { TIME } from '@shared/constants/time';
import { supabase } from '@shared/lib/supabase/client';

// Constants for time calculations
const DAYS_IN_MONTH = TIME.DAYS_PER_MONTH_APPROX;
const MONTHS_IN_YEAR = TIME.MONTHS_PER_YEAR;
const MINUTES_IN_HOUR = TIME.MINUTES_PER_HOUR;
const HOURS_IN_DAY = TIME.HOURS_PER_DAY;
const MILLISECONDS_IN_SECOND = TIME.SECOND_IN_MS;

// Cache durations
const STALE_TIME_MINUTES = 5;
const GARBAGE_COLLECTION_TIME_MINUTES = TIME.DAYS_PER_MONTH_APPROX;

// Utility function to check if employee is active on a given date
export const isEmployeeActiveOnDate = (
  employee: { start_date?: string | null; end_date?: string | null },
  checkDate: Date = new Date()
) => {
  const startDate = employee.start_date ? new Date(employee.start_date) : null;
  const endDate = employee.end_date ? new Date(employee.end_date) : null;

  // Employee is active if:
  // 1. No start date OR start date is before/on check date
  // 2. No end date OR end date is after/on check date
  return (
    (!startDate || startDate <= checkDate) && (!endDate || endDate >= checkDate)
  );
};

// Employee interface for active period checking
interface EmployeeForPeriod {
  start_date?: string | null;
  end_date?: string | null;
}

// Utility function to get active employees for a date range
export const getActiveEmployeesForPeriod = (
  employees: EmployeeForPeriod[],
  startDate: Date,
  endDate: Date
) => {
  return employees.filter((emp) => {
    const empStartDate = emp.start_date ? new Date(emp.start_date) : null;
    const empEndDate = emp.end_date ? new Date(emp.end_date) : null;

    // Employee was active during this period if:
    // - Started before or during the period AND
    // - Ended after the period started (or still active)
    return (
      (!empStartDate || empStartDate <= endDate) &&
      (!empEndDate || empEndDate >= startDate)
    );
  });
};

// Utility function to calculate employee tenure
export const calculateEmployeeTenure = (
  startDate: string,
  endDate?: string
) => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(
    diffTime / (MILLISECONDS_IN_SECOND * MINUTES_IN_HOUR * HOURS_IN_DAY)
  );

  const months = Math.floor(diffDays / DAYS_IN_MONTH);
  const years = Math.floor(months / MONTHS_IN_YEAR);
  const remainingMonths = months % MONTHS_IN_YEAR;

  return {
    totalMonths: months,
    years,
    months: remainingMonths,
    days: diffDays,
    isActive: !endDate,
  };
};

export const useEmployeeData = (selectedBranch: string) => {
  return useQuery({
    queryKey: ['employees', selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select(
          `
          *,
          salary_plans!employees_salary_plan_id_fkey (
            id,
            name,
            type,
            config
          ),
          branches (
            id,
            name,
            name_ar
          ),
          sponsors (
            name_ar
          )
        `
        )
        .eq('is_archived', false);

      if (selectedBranch !== 'all') {
        query = query.eq('branch_id', selectedBranch);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: MILLISECONDS_IN_SECOND * MINUTES_IN_HOUR * STALE_TIME_MINUTES,
    gcTime:
      MILLISECONDS_IN_SECOND *
      MINUTES_IN_HOUR *
      GARBAGE_COLLECTION_TIME_MINUTES,
  });
};
