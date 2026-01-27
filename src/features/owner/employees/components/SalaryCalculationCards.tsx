import { format } from 'date-fns';
import { Calculator } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '@shared/ui/components/card';

import type { SalaryCalculationCardsProps } from '../types/index';

import { BranchSalaryTotalsCard } from './BranchSalaryTotalsCard';
import { SalaryCalculationCard } from './SalaryCalculationCard';

import { getPayrollWindow } from '@/features/owner/employees/utils';
import { formatPrice } from '@/features/owner/employees/utils/formatting';



export const SalaryCalculationCards: React.FC<SalaryCalculationCardsProps> = ({
  calculations,
  selectedMonth,
  monthlyDeductions,
  monthlyLoans,
  monthlyBonuses,
  employees,
}): JSX.Element => {
  const { windowStart, windowEnd } = getPayrollWindow(selectedMonth);
  const payrollWindowLabel = `${format(windowStart, 'MMM d')} → ${format(windowEnd, 'MMM d')}`;

  // Calculate total gross salary payout (before any deductions)
  // Using the correct formula: base + commissions + bonuses
  const totalPayout = calculations.reduce((sum, calc) => {
    const grossSalary =
      calc.basicSalary + calc.commission + calc.targetBonus + calc.extraBonuses;
    return sum + grossSalary;
  }, 0);

  if (calculations.length === 0) {
    return (
      <Card className="mx-4">
        <CardContent className="py-8 text-center">
          <div className="text-gray-500 mb-4">
            <Calculator className="mx-auto h-12 w-12 mb-2" />
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            No salary calculations available. Click &ldquo;Calculate
            Salaries&rdquo; to generate salary data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Salary Calculations
          </h3>
          <p className="text-sm text-gray-600">
            Review salaries for {format(new Date(selectedMonth), 'MMMM yyyy')}
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
            Payroll window: {payrollWindowLabel}
          </div>
        </div>
      </div>

      {/* Branch Salary Totals */}
      <BranchSalaryTotalsCard
        calculations={calculations}
        employees={employees}
      />

      {/* Salary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {calculations.map((calculation) => {
          // Filter deductions and loans for this specific employee
          const employeeDeductions = monthlyDeductions.filter(
            (d) => d.employee_name === calculation.employeeName
          );
          const employeeLoans = monthlyLoans.filter(
            (l) => l.employee_name === calculation.employeeName
          );
          const employeeBonuses = monthlyBonuses.filter(
            (b) => b.employee_name === calculation.employeeName
          );

          return (
            <SalaryCalculationCard
              key={calculation.employeeName}
              calculation={calculation}
              selectedMonth={selectedMonth}
              employeeDeductions={employeeDeductions}
              employeeLoans={employeeLoans}
              employeeBonuses={employeeBonuses}
            />
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="px-4">
        <Card className="bg-gray-50 border-2 border-gray-300">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Total Gross Salary Payout:
                </span>
                <span className="text-lg font-bold text-blue-800">
                  {formatPrice(totalPayout)}
                </span>
              </div>
              <div className="text-xs text-gray-600 text-center border-t pt-2">
                💡 This shows total salary obligation before loan deductions.
                Individual net amounts (after loans) are shown per employee.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalaryCalculationCards;
