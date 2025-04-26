
// Define types for salary calculations
export interface EmployeeSalary {
  id: string;
  name: string;
  salesAmount?: number;
  baseSalary: number;
  commission: number;
  bonus: number; // Changed from optional to required
  targetBonus?: number;
  deductions: number;
  loans: number;
  total: number;
  calculationError?: string;
}

export interface SalaryCalculationError {
  employeeId: string;
  employeeName: string;
  error: string;
  details?: Record<string, unknown>;
}

export interface UseSalaryDataProps {
  employees: Array<{
    id: string;
    name: string;
    name_ar: string; // Added missing required fields
    email: string;
    role: string;
    working_hours: Record<string, string[]>;
    salary_plan_id?: string;
  }>;
  selectedMonth: string;
}

export interface UseSalaryDataResult {
  salaryData: EmployeeSalary[];
  isLoading: boolean;
  getEmployeeTransactions: (employeeId: string) => {
    bonuses: any[];
    deductions: any[];
    loans: any[];
    salesData: any | null;
  };
  calculationErrors: SalaryCalculationError[];
  refreshData: () => void;
}

// Type cast helper for Supabase JSON
export const asRecord = (json: unknown): Record<string, unknown> => {
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as Record<string, unknown>;
    } catch (e) {
      return {};
    }
  }
  return json as Record<string, unknown>;
};
