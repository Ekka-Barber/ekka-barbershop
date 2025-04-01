import { WorkingHours } from './service';

export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  branch_id?: string;
  role: 'barber' | 'manager' | 'cashier' | 'other';
  working_hours?: WorkingHours;
  off_days?: string[];
  photo_url?: string;
  nationality?: string;
}

export interface EmployeeSales {
  id: string;
  employee_name: string;
  month: string; // Format: 'YYYY-MM-DD' for the first day of the month
  sales_amount: number;
  created_at?: string;
  updated_at?: string;
}
