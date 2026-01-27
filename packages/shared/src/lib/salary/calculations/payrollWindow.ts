import { differenceInCalendarDays, format } from 'date-fns';

interface PayrollWindow {
  windowStart: Date;
  windowEnd: Date;
  windowStartDate: string;
  windowEndDate: string;
}

const createUTCDate = (
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
): Date => {
  return new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
};

export const parseDateAsUTC = (value?: string | null): Date | null => {
  if (!value) return null;
  if (value.includes('T')) {
    return new Date(value);
  }
  return new Date(`${value}T00:00:00Z`);
};

export const getActiveWorkdayRatio = (
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  windowStart: Date,
  windowEnd: Date
): number => {
  const parsedStart = parseDateAsUTC(startDate);
  const parsedEnd = parseDateAsUTC(endDate);

  const effectiveStart =
    parsedStart && parsedStart > windowStart ? parsedStart : windowStart;
  const effectiveEnd =
    parsedEnd && parsedEnd < windowEnd ? parsedEnd : windowEnd;

  if (effectiveEnd < effectiveStart) {
    return 0;
  }

  const totalWindowDays = Math.max(
    1,
    differenceInCalendarDays(windowEnd, windowStart) + 1
  );
  const daysActive = Math.max(
    0,
    differenceInCalendarDays(effectiveEnd, effectiveStart) + 1
  );

  return Math.min(1, Math.max(0, daysActive / totalWindowDays));
};

export const getPayrollWindow = (selectedMonth: string): PayrollWindow => {
  const [yearString, monthString] = selectedMonth.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  const windowStart = createUTCDate(year, monthIndex - 1, 26);
  const windowEnd = createUTCDate(
    year,
    monthIndex,
    25,
    23,
    59,
    59,
    999
  );

  return {
    windowStart,
    windowEnd,
    windowStartDate: format(windowStart, 'yyyy-MM-dd'),
    windowEndDate: format(windowEnd, 'yyyy-MM-dd'),
  };
};
