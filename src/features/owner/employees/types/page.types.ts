export interface EmployeesProps {
  selectedBranch: string;
}

export interface EmployeeFinancialRecord {
  employee_name: string;
  description: string;
  amount: number;
  date: string;
}

export interface SalaryData {
  baseSalary: number;
  commission: number;
  targetBonus: number;
  totalSalary: number;
  deductions: number;
  loans: number;
  bonuses: number;
}

export interface CategorySalaryData {
  category: {
    id: string;
    name_en: string;
  };
  subcategory?: {
    id: string;
    name_en: string;
  } | null;
}

export interface EmployeeFinancialRecords {
  [employeeName: string]: Array<{
    description: string;
    amount: string;
    date: string;
  }>;
}
