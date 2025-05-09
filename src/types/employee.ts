export type TimeRange = string; // Represents a time interval, e.g., "09:00-17:00"

export interface WorkingHours {
  [day: string]: TimeRange[];
}

export type EmployeeRole = 
  | "manager"
  | "barber"
  | "receptionist"
  | "cleaner"
  | "massage_therapist"
  | "hammam_specialist";

export interface Employee {
  id: string;
  name: string;
  name_ar?: string | null; // Changed from required string
  email?: string | null; // Changed from required string
  phone?: string;
  role: EmployeeRole; // Changed from string to EmployeeRole union type
  branch_id?: string | null;
  photo_url?: string | null; // Also made explicitly nullable
  working_hours?: WorkingHours | null; // Allow null for working_hours
  off_days?: string[] | null;
  nationality?: string | null; // Also made explicitly nullable
  salary_plan_id?: string | null;
  start_date?: string | null;
  annual_leave_quota?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeSales {
  id: string;
  employee_id?: string;
  employee_name: string;
  month: string;
  sales_amount: number;
  created_at?: string;
  updated_at?: string;
}
