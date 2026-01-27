import { EmployeeDeduction, EmployeeLoan, EmployeeBonus } from "@/features/manager/types/salary";

export function processDeductions(deductions: EmployeeDeduction[]) {
  return deductions.map(deduction => ({
    ...deduction,
    id: deduction.id || String(Math.random()),
    amount: Number(deduction.amount) || 0,
    description: deduction.description || "خصم"
  }));
}

export function processLoans(loans: EmployeeLoan[]) {
  return loans.map(loan => ({
    ...loan,
    amount: Number(loan.amount) || 0,
    date: loan.date || "",
    description: loan.description || "سلفة",
    id: loan.id,
    employee_id: loan.employee_id,
    employee_name: loan.employee_name,
    created_at: loan.created_at,
    updated_at: loan.updated_at,
  }));
}

export function processBonuses(bonuses: EmployeeBonus[]) {
  return bonuses.map(bonus => ({
    ...bonus,
    amount: Number(bonus.amount) || 0,
    description: bonus.description || "مكافأة"
  }));
}
