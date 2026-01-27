import { calculateSalary } from '@shared/lib/salary/calculations';
import { supabase } from '@shared/lib/supabase/client';
import { EmployeeWithSalaryPlan, DynamicField } from '@shared/types/business';

import {
  getActiveWorkdayRatio,
  getPayrollWindow,
} from '@/features/owner/employees/utils';

// Employee is now imported as EmployeeWithSalaryPlan from @/types/business

interface Calculation {
  employeeId?: string;
  employeeName: string;
  sales: number;
  basicSalary: number;
  commission: number;
  targetBonus: number;
  deductions: number;
  loans: number;
  totalSalary: number;
  netSalary: number;
  extraBonuses: number;
  grossSalary: number;
  // Add plan information for transparency
  salaryPlanName?: string;
}

export const useEmployeeCalculationActions = (
  employees: EmployeeWithSalaryPlan[],
  salesInputs: Record<string, string>,
  deductionsFields: Record<string, DynamicField[]>,
  bonusFields: Record<string, DynamicField[]>,
  selectedMonth: string,
  setCalculations: (calc: Calculation[]) => void
) => {
  const handleCalculate = async () => {
    const { windowStart, windowEnd, windowStartDate, windowEndDate } =
      getPayrollWindow(selectedMonth);

    // Filter to only include employees who were active during the payroll window
    const activeEmployees = employees.filter((emp: EmployeeWithSalaryPlan) => {
      const empStartDate = emp.start_date ? new Date(emp.start_date) : null;
      const empEndDate = emp.end_date ? new Date(emp.end_date) : null;

      return (
        (!empStartDate || empStartDate <= windowEnd) &&
        (!empEndDate || empEndDate > windowStart)
      );
    });

    // Create employee ID to name mapping using only active employees
    const employeeIds = activeEmployees.map((emp) => emp.id);

    // Fetch all data in bulk using active employee IDs only
    const [
      deductionsResponse,
      bonusesResponse,
      loansResponse,
    ] = await Promise.all([
      (() => {
        let query = supabase
          .from('employee_deductions')
          .select('amount, employee_name, employee_id')
          .gte('date', windowStartDate)
          .lte('date', windowEndDate);

        if (employeeIds.length > 0) {
          query = query.in('employee_id', employeeIds);
        }

        return query;
      })(),
      (() => {
        let query = supabase
          .from('employee_bonuses')
          .select('amount, employee_name, employee_id')
          .gte('date', windowStartDate)
          .lte('date', windowEndDate);

        if (employeeIds.length > 0) {
          query = query.in('employee_id', employeeIds);
        }

        return query;
      })(),
      (() => {
        let query = supabase
          .from('employee_loans')
          .select('amount, employee_name, employee_id, date')
          .gte('date', windowStartDate)
          .lte('date', windowEndDate);

        if (employeeIds.length > 0) {
          query = query.in('employee_id', employeeIds);
        }

        return query;
      })(),
    ]);

    // Group data by employee ID and then map to employee name
    const deductionsByEmployeeId = (deductionsResponse.data || []).reduce(
      (
        acc: Record<string, number>,
        d: { employee_id: string; amount: number }
      ) => {
        acc[d.employee_id] = (acc[d.employee_id] || 0) + Number(d.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const bonusesByEmployeeId = (bonusesResponse.data || []).reduce(
      (
        acc: Record<string, number>,
        b: { employee_id: string; amount: number }
      ) => {
        acc[b.employee_id] = (acc[b.employee_id] || 0) + Number(b.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const loansByEmployeeId = (loansResponse.data || []).reduce(
      (
        acc: Record<string, number>,
        l: { employee_id: string; amount: number }
      ) => {
        acc[l.employee_id] = (acc[l.employee_id] || 0) + Number(l.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate salaries only for active employees
    const newCalculations = await Promise.all(
      activeEmployees.map(async (employee) => {
        const sales = Number(salesInputs[employee.name] || 0);
        const employeeDeductions = deductionsFields[employee.name] || [];
        const employeeBonuses = bonusFields[employee.name] || [];

        const totalDeductions = deductionsByEmployeeId[employee.id] || 0;
        const totalBonuses = bonusesByEmployeeId[employee.id] || 0;
        const totalLoanAmount = loansByEmployeeId[employee.id] || 0;

        // Calculate manual deductions from form fields
        const manualDeductions = employeeDeductions.reduce(
          (sum, d) => sum + Number(d.amount || 0),
          0
        );

        const salaryPlan = employee.salary_plans;
        const salaryPlanName = salaryPlan?.name || 'Default Plan';

        const { commission, targetBonus, total, basicSalary } = calculateSalary(
          sales,
          employeeDeductions,
          employeeBonuses,
          salaryPlan // Use the assigned or default plan
        );

        const prorationRatio = getActiveWorkdayRatio(
          employee.start_date,
          employee.end_date,
          windowStart,
          windowEnd
        );

        const proratedBasicSalary = basicSalary * prorationRatio;
        const proratedTotal = total - basicSalary + proratedBasicSalary;
        const planGross = proratedTotal + totalBonuses;

        // Calculate final salary with proper deduction handling
        // Subtract both DB deductions, manual deductions, and loans
        const totalAllDeductions = totalDeductions + manualDeductions;
        const salaryAfterDeductions = planGross - totalAllDeductions;
        const finalSalary = salaryAfterDeductions - totalLoanAmount;

        return {
          employeeId: employee.id,
          employeeName: employee.name,
          sales: Math.round(sales),
          basicSalary: Math.round(proratedBasicSalary),
          commission: Math.round(commission),
          targetBonus: Math.round(targetBonus),
          deductions: Math.round(totalAllDeductions),
          loans: Math.round(totalLoanAmount),
          totalSalary: Math.round(salaryAfterDeductions), // Gross salary after deductions but BEFORE loan deductions
          netSalary: Math.round(finalSalary), // Net salary after all deductions including loans
          extraBonuses: Math.round(totalBonuses),
          grossSalary: Math.round(planGross), // Original gross salary before any deductions
          salaryPlanName,
        };
      })
    );

    setCalculations(newCalculations);
  };

  return {
    handleCalculate,
  };
};
