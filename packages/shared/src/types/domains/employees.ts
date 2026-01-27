import type { Database } from '@shared/types/database.types';

export type DocumentType = 'health_certificate' | 'residency_permit' | 'work_license' | 'custom';

export type Employee = Database['public']['Tables']['employees']['Row'];
export type EmployeeInsert =
  Database['public']['Tables']['employees']['Insert'];
export type EmployeeUpdate =
  Database['public']['Tables']['employees']['Update'];

export type EmployeeBonus =
  Database['public']['Tables']['employee_bonuses']['Row'];
export type EmployeeBonusInsert =
  Database['public']['Tables']['employee_bonuses']['Insert'];
export type EmployeeBonusUpdate =
  Database['public']['Tables']['employee_bonuses']['Update'];

export type EmployeeDeduction =
  Database['public']['Tables']['employee_deductions']['Row'];
export type EmployeeDeductionInsert =
  Database['public']['Tables']['employee_deductions']['Insert'];
export type EmployeeDeductionUpdate =
  Database['public']['Tables']['employee_deductions']['Update'];

export type EmployeeLoan =
  Database['public']['Tables']['employee_loans']['Row'];
export type EmployeeLoanInsert =
  Database['public']['Tables']['employee_loans']['Insert'];
export type EmployeeLoanUpdate =
  Database['public']['Tables']['employee_loans']['Update'];

export type EmployeeSales =
  Database['public']['Tables']['employee_sales']['Row'];
export type EmployeeSalesInsert =
  Database['public']['Tables']['employee_sales']['Insert'];
export type EmployeeSalesUpdate =
  Database['public']['Tables']['employee_sales']['Update'];

export type EmployeeDocument =
  Database['public']['Tables']['employee_documents']['Row'];
export type EmployeeDocumentInsert =
  Database['public']['Tables']['employee_documents']['Insert'];
export type EmployeeDocumentUpdate =
  Database['public']['Tables']['employee_documents']['Update'];

export type EmployeeHoliday =
  Database['public']['Tables']['employee_holidays']['Row'];
export type EmployeeHolidayInsert =
  Database['public']['Tables']['employee_holidays']['Insert'];
export type EmployeeHolidayUpdate =
  Database['public']['Tables']['employee_holidays']['Update'];

export type EmployeeDocumentWithStatus =
  Database['public']['Views']['employee_documents_with_status']['Row'];
