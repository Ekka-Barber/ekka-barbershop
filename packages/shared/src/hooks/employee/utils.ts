import { TIME } from '@shared/constants/time';

const DAYS_IN_MONTH = TIME.DAYS_PER_MONTH_APPROX;
const MONTHS_IN_YEAR = TIME.MONTHS_PER_YEAR;
const MINUTES_IN_HOUR = TIME.MINUTES_PER_HOUR;
const HOURS_IN_DAY = TIME.HOURS_PER_DAY;
const MILLISECONDS_IN_SECOND = TIME.SECOND_IN_MS;

export interface EmployeeForPeriod {
  start_date?: string | null;
  end_date?: string | null;
}

export interface EmployeeTenure {
  totalMonths: number;
  years: number;
  months: number;
  days: number;
  isActive: boolean;
}

export const isEmployeeActiveOnDate = (
  employee: { start_date?: string | null; end_date?: string | null },
  checkDate: Date = new Date()
): boolean => {
  const startDate = employee.start_date ? new Date(employee.start_date) : null;
  const endDate = employee.end_date ? new Date(employee.end_date) : null;

  return (
    (!startDate || startDate <= checkDate) && (!endDate || endDate >= checkDate)
  );
};

export const getActiveEmployeesForPeriod = (
  employees: EmployeeForPeriod[],
  startDate: Date,
  endDate: Date
): EmployeeForPeriod[] => {
  return employees.filter((emp) => {
    const empStartDate = emp.start_date ? new Date(emp.start_date) : null;
    const empEndDate = emp.end_date ? new Date(emp.end_date) : null;

    return (
      (!empStartDate || empStartDate <= endDate) &&
      (!empEndDate || empEndDate >= startDate)
    );
  });
};

export const calculateEmployeeTenure = (
  startDate: string,
  endDate?: string
): EmployeeTenure | null => {
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
