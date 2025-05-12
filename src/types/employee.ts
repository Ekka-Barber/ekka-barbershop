/**
 * Types for the employee data used in barber booking functionality
 */

// Base employee type for barber booking
export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  branch_id: string;
  role: string;
  photo_url?: string;
  nationality?: string;
  email?: string;
  start_date?: string;
  is_archived?: boolean;
  working_hours?: {
    [day: string]: string[];
  };
  off_days?: string[];
}

// Employee sales data type for performance metrics
export interface EmployeeSales {
  employee_name: string;
  sales_amount: number;
}

// Type for working hours slot
export interface WorkingHoursSlot {
  day: string;
  slots: string[];
}

// Type for employee availability
export interface EmployeeAvailability {
  employeeId: string;
  date: string;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
} 