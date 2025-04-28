// src/types/payslip.ts
export interface PayslipTransaction {
  description: string;
  amount: number;
  date: string;
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
  companyName: "Ekka Barbershop (مثال)",
  companyLogoUrl: "/placeholder-logo.png", // Replace with your actual logo path
  payPeriod: "يناير 2024",
  issueDate: "2024-01-31",
  employee: {
    nameAr: "جون دو",
    branch: "الفرع الرئيسي",
    role: "حلاق أول",
    email: "john.doe@example.com",
  },
  bonuses: [],
  deductions: [
    { description: "خصم غياب", amount: 150, date: "2024-01-31" },
    { description: "سلفة موظف", amount: 500, date: "2024-01-31" },
  ],
  loans: [
    { description: "الرصيد المستحق", amount: 3000, date: "2024-01-31" },
    { description: "الدفع الشهري", amount: 500, date: "2024-01-31" },
  ],
  totalSales: 0,
  summary: {
    totalEarnings: 0,
    totalDeductions: 650,
    netSalary: 3600,
  },
}; 