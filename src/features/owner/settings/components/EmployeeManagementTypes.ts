// Re-export from shared types
export type { Employee, Branch, Sponsor } from '@shared/types/domains';
export type { SalaryPlan } from '@shared/types/domains/salary';

export type EmployeeRole =
  | 'manager'
  | 'barber'
  | 'receptionist'
  | 'cleaner'
  | 'massage_therapist'
  | 'hammam_specialist';
