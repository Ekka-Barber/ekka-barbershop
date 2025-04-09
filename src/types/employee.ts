
export type TimeRange = string; // Format: "HH:mm-HH:mm"

export interface WorkingHours {
  [day: string]: TimeRange[];
}

export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  email: string;
  phone?: string;
  role: string;
  branch_id?: string;
  photo_url?: string;
  working_hours: WorkingHours;
  off_days?: string[];
  nationality?: string;
  salary_plan_id?: string;
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
