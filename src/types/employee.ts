import { Json } from './supabase-generated';

export type TimeRange = string; // Format: "HH:mm-HH:mm"

export interface WorkingHours {
  [day: string]: TimeRange[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  branch_id?: string;
  photo_url?: string;
  working_hours: WorkingHours;
  off_days?: string[];
  nationality?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeSales {
  id: string;
  employee_name: string;
  month: string;
  sales_amount: number;
  created_at?: string;
  updated_at?: string;
}
