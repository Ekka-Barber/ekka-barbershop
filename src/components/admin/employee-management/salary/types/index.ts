export interface EmployeeMonthlySalary {
  id: string; // uuid
  employee_id: string; // uuid
  employee_name_snapshot: string;
  month_year: string; // "YYYY-MM"
  payment_confirmation_date: string; // ISO Date string (from DATE type)
  base_salary: number; // NUMERIC(10, 2)
  sales_amount?: number | null; // NUMERIC(10, 2)
  commission_amount?: number | null; // NUMERIC(10, 2)
  total_bonuses?: number | null; // NUMERIC(10, 2)
  total_deductions?: number | null; // NUMERIC(10, 2)
  total_loan_repayments?: number | null; // NUMERIC(10, 2)
  net_salary_paid: number; // NUMERIC(10, 2)
  salary_plan_name_snapshot?: string | null;
  calculation_details_json?: Record<string, unknown> | null; // JSONB
  // created_at?: string; // TIMESTAMPTZ - Not typically shown in this table view
  // updated_at?: string; // TIMESTAMPTZ - Not typically shown in this table view
} 