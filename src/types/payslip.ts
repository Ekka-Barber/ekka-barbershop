// src/types/payslip.ts
export interface PayslipTransaction {
  description: string;
  amount: number;
  date: string;
}

export interface SalaryPlanConfig {
  name: string;
  type: 'dynamic_basic' | 'fixed';
  blocks: Array<{
    id: string;
    type: 'basic_salary' | 'commission' | 'fixed_amount';
    config: {
      base_salary?: number;
      tiered_bonus?: Array<{
        bonus: number;
        sales_target: number;
      }>;
      rate?: number;
      threshold?: number;
      amount?: number;
    };
  }>;
  description: string;
}

export interface PayslipData {
  companyName: string;
  companyLogoUrl: string;
  payPeriod: string;
  issueDate: string;
  employee: {
    nameAr: string;
    branch: string;
    role: string;
    email: string;
    salary_plan_id: string;
    salaryPlan?: {
      id: string;
      name: string;
      type: 'dynamic_basic' | 'fixed';
      config: {
        name: string;
        type: 'dynamic_basic' | 'fixed';
        blocks: Array<{
          id: string;
          type: 'basic_salary' | 'commission' | 'fixed_amount';
          config: {
            base_salary?: number;
            tiered_bonus?: Array<{
              bonus: number;
              sales_target: number;
            }>;
            rate?: number;
            threshold?: number;
            amount?: number;
          };
        }>;
        description: string;
      };
    } | null;
  };
  bonuses: PayslipTransaction[];
  deductions: PayslipTransaction[];
  loans: PayslipTransaction[];
  totalSales: number;
  summary: {
    totalEarnings: number;
    totalDeductions: number;
    netSalary: number;
  };
}

// Sample Data (for PayslipTemplateViewer)
export const samplePayslipData: PayslipData = {
  companyName: "Ekka Barbershop",
  companyLogoUrl: "/placeholder-logo.png",
  payPeriod: "أبريل 2025",
  issueDate: "2025-04-30",
  employee: {
    nameAr: "أشرف",
    branch: "الواصلية",
    role: "حلاق",
    email: "ashraf@example.com",
    salary_plan_id: "a8b69d42-aaa1-4a95-8717-13fe6e99550d",
    salaryPlan: {
      id: "a8b69d42-aaa1-4a95-8717-13fe6e99550d",
      name: "Fixed Basic 1800",
      type: "fixed",
      config: {
        name: "راتب ثابت",
        type: "fixed",
        blocks: [
          {
            id: "1",
            type: "fixed_amount",
            config: {
              amount: 1800
            }
          }
        ],
        description: "راتب شهري ثابت ١٨٠٠ ريال"
      }
    }
  },
  bonuses: [],
  deductions: [
    { description: "ادارة خزا", amount: 100, date: "2025-04-21" },
    { description: "نص يوم (الجمعة 25)", amount: 100, date: "2025-04-25" }
  ],
  loans: [
    { description: "%تذاكر طيران 1714 + 20", amount: 2057, date: "2025-04-20" }
  ],
  totalSales: 0,
  summary: {
    totalEarnings: 3750,
    totalDeductions: 406,
    netSalary: 3294
  }
}; 