
import { supabase } from "@shared/lib/supabase/client";

export async function fetchEmployeeMeta(employeeId: string) {
  return await supabase
    .from("employees")
    .select("id, salary_plan_id")
    .eq("id", employeeId)
    .single();
}

export async function fetchSalaryPlan(salaryPlanId: string) {
  return await supabase
    .from("salary_plans")
    .select("id, name, type, config")
    .eq("id", salaryPlanId)
    .single();
}

export async function fetchSales(employeeName: string, month: string) {
  return await supabase
    .from("employee_sales")
    .select("sales_amount, month, updated_at")
    .eq("employee_name", employeeName)
    .eq("month", month);
}

export async function fetchDeductions(
  employeeId: string,
  windowStartDate: string,
  windowEndDate: string
) {
  return await supabase
    .from("employee_deductions")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", windowStartDate)
    .lte("date", windowEndDate);
}

export async function fetchLoans(
  employeeId: string,
  windowStartDate: string,
  windowEndDate: string
) {
  return await supabase
    .from("employee_loans")
    .select("amount, date, description, id, employee_id, employee_name, created_at, updated_at")
    .eq("employee_id", employeeId)
    .gte("date", windowStartDate)
    .lte("date", windowEndDate);
}

export async function fetchBonuses(
  employeeId: string,
  windowStartDate: string,
  windowEndDate: string
) {
  return await supabase
    .from("employee_bonuses")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", windowStartDate)
    .lte("date", windowEndDate);
}

export async function fetchEmployeeSpecificBonus(
  employeeId: string,
  windowStartDate: string,
  windowEndDate: string
) {
  return await supabase
    .from("employee_bonuses")
    .select("*")
    .gte("date", windowStartDate)
    .lte("date", windowEndDate)
    .eq("employee_id", employeeId);
}
