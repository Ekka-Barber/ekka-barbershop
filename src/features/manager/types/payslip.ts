import { enhancedMapSalaryToPayslipData } from '../employees/payslip/formatters';

import { EmployeeBonus, EmployeeDeduction, EmployeeLoan, SalaryPlanType } from './salary';

export interface PayslipData {
  companyName: string; // Default: "إكه للعناية بالرجل"
  companyLogoUrl: string;
  payPeriod: string;
  issueDate: string;
  employee: {
    id: string;
    nameAr: string;
    branch?: string;
    role: string;
    salaryPlan?: {
      name: string;
      type: string;
      config?: {
        name?: string;
        description?: string;
      }
    }
    salary_plan_id?: string;
  };
  totalSales: number;
  targetSales?: number; // Sales target amount (optional)
  baseSalary: number; // Base salary amount
  commission: number; // Commission amount
  commissionRate?: number; // Commission rate (e.g., 0.1 for 10%)
  commissionThreshold?: number; // Sales threshold for commission calculation
  bonuses: Array<{
    amount: number;
    description: string;
    date: string;
  }>;
  deductions: Array<{
    amount: number;
    description: string;
    date: string;
  }>;
  loans: Array<{
    amount: number;
    description: string;
    date: string;
  }>;
  summary: {
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
  }
}

export interface PayslipButtonProps {
  employeeData: {
    id: string;
    name: string;
    name_ar?: string;
    role: string;
    photo_url?: string;
    nationality?: string;
    branch?: string;
  };
  salaryData: {
    planName: string | null;
    planType: SalaryPlanType | null;
    baseSalary: number;
    commission: number;
    targetBonus: number;
    bonusList: Array<EmployeeBonus>;
    deductionsList: Array<EmployeeDeduction>;
    loansList: Array<EmployeeLoan>;
    deductions: number;
    loans: number;
    netSalary: number;
    totalSales?: number;
    targetSales?: number;
    commissionRate?: number;
    commissionThreshold?: number;
  };
}

export interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeData: PayslipButtonProps['employeeData'];
  salaryData: PayslipButtonProps['salaryData'];
}

export interface PayslipViewerProps {
  employeeData: PayslipButtonProps['employeeData'];
  salaryData: PayslipButtonProps['salaryData'];
  payPeriod?: string; // Optional pay period, if not provided will use current month
  onError?: (error: Error) => void;
}

// Style constants for consistency
export interface PayslipColors {
  primaryGold: string;
  secondaryGold: string;
  tertiaryGold: string;
  backgroundGray: string;
  documentBg: string;
  textPrimary: string;
  textSecondary: string;
  positive: string;
  negative: string;
  progressBarLight: string;
  progressBarMedium: string;
  progressBarDark: string;
}

// Original helper function to map salary data to payslip format (kept for backward compatibility)
export const mapSalaryToPayslipData = (
  employeeData: PayslipButtonProps['employeeData'],
  salaryData: PayslipButtonProps['salaryData'],
  payPeriod: string
): PayslipData => {
  // We now use the enhanced version that provides better validation and fallbacks
  return enhancedMapSalaryToPayslipData(employeeData, salaryData, payPeriod);
}; 
