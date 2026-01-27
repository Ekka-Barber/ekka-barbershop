import type { EmployeeLoan } from '@shared/types/domains';

import type { LoanEditingRecord } from '../types/loansTypes';

export { getActiveWorkdayRatio, getPayrollWindow } from '@shared/lib/salary/calculations/index';

export { formatPrice } from './formatting';

/**
 * Adapter function to convert EmployeeLoan to LoanEditingRecord
 */
export const createLoanEditingRecord = (
  loan: EmployeeLoan
): LoanEditingRecord => {
  return {
    id: loan.id,
    description: loan.description,
    amount: loan.amount.toString(),
    date: loan.date || '',
  };
};

/**
 * Generates employee initials from name
 */
export const getEmployeeInitials = (name: string): string => {
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[1].charAt(0).toUpperCase()
    );
  }
  return name.charAt(0).toUpperCase();
};

/**
 * Formats a date string to a localized date format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Formats month and year for display
 */
export const formatMonthYear = (monthString: string): string => {
  return new Date(monthString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Parses a date string and normalizes it to UTC midnight.
 */
export const parseDateAsUTC = (value?: string | null): Date | null => {
  if (!value) return null;
  if (value.includes('T')) {
    return new Date(value);
  }
  return new Date(`${value}T00:00:00Z`);
};

