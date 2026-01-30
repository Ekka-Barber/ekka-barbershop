import { DynamicField } from '@shared/types/business/calculations';
import { Employee } from '@shared/types/domains';

export interface EnhancedEmployeeCardProps {
  employee: Employee;
  salesValue: string;
  onSalesChange: (value: string) => void;
  refetchEmployees?: () => void;
  selectedMonth: string;
  monthlyDeductions: DynamicField[];
  monthlyLoans: DynamicField[];
  monthlyBonuses: DynamicField[];
  // Salary plan assignment props
  onSalaryPlanChange?: (employeeId: string, planId: string) => void;
}

export interface EmployeeCardData {
  salesInputId: string;
  totalDeductions: number;
  totalLoans: number;
  totalBonuses: number;
  salesAmount: number;
}
