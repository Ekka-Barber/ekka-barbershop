import type { EmployeeHoliday } from '@shared/types/domains';

export type { EmployeeHoliday };

export interface LeaveBalance {
  totalDaysTaken: number;
  entitledDays: number;
  daysRemaining: number;
  isNegative: boolean;
}
