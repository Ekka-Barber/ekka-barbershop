import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Calculator, DollarSign } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader } from '@shared/ui/components/card';


import { EmployeeAvatar } from './EmployeeAvatar';
import { LoanInformation } from './LoanInformation';
import { SalaryBreakdownAccordion } from './SalaryBreakdownAccordion';
import { QuickSummaryCards } from './SalaryCalculationQuickSummaryCards';

import type { SalaryCalculationCardProps } from '@/features/owner/employees/types';
import {
  formatPrice,
  calculateTotalDeductionsAndLoans,
} from '@/features/owner/employees/utils/formatting';

export const SalaryCalculationCard: React.FC<SalaryCalculationCardProps> = ({
  calculation,
  selectedMonth,
  employeeDeductions,
  employeeLoans,
  employeeBonuses,
}): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Calculate totals for this employee
  const totalDeductions = employeeDeductions.reduce(
    (sum, d) => sum + d.amount,
    0
  );
  const totalLoans = employeeLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalBonuses = employeeBonuses.reduce((sum, b) => sum + b.amount, 0);
  const totalDeductionsAndLoans = calculateTotalDeductionsAndLoans(
    employeeDeductions,
    employeeLoans
  );

  // Calculate gross salary: base + commissions + target bonus (from plan) + extra bonuses (monthly)
  // Note: targetBonus already includes tier-based bonuses from salary plan
  // totalBonuses are the monthly bonuses which should be the same as extraBonuses
  const grossSalary =
    calculation.basicSalary +
    calculation.commission +
    calculation.targetBonus +
    calculation.extraBonuses;

  // Calculate net salary: gross - loans - deductions (this is the amount to transfer to employee bank account)
  const netSalary = grossSalary - totalLoans - totalDeductions;

  const handleToggleExpansion = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-200 flex flex-col hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <EmployeeAvatar employeeName={calculation.employeeName} />

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-lg leading-tight truncate text-gray-900"
                title={calculation.employeeName}
              >
                {calculation.employeeName}
              </h3>
              <div className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                <Calculator className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Salary Calculation</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {format(new Date(selectedMonth), 'MMM yyyy')}
                </span>
              </div>
              {/* Salary Plan Information */}
              {calculation.salaryPlanName && (
                <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                  <span className="truncate">Plan: {calculation.salaryPlanName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpansion}
            className="p-2 h-8 w-8 rounded-full hover:bg-white/50"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col">
        {/* Total Salary - Always Visible */}
        <div className="mb-4 space-y-3">
          {/* Gross Salary */}
          <div className="p-4 bg-blue-50 rounded-lg text-center border-2 border-blue-200">
            <div className="text-sm text-blue-700 font-medium">
              Gross Salary
            </div>
            <div className="text-xl font-bold text-blue-800">
              {formatPrice(grossSalary)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Before loan deductions
            </div>
          </div>

          {/* Loan Deduction Info (if applicable) */}
          {calculation.loans > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-200">
              <div className="text-sm text-yellow-700 font-medium">
                Loan Deduction
              </div>
              <div className="text-lg font-semibold text-yellow-800">
                -{formatPrice(calculation.loans)}
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                Loan repayment for {format(new Date(selectedMonth), 'MMM yyyy')}
              </div>
            </div>
          )}

          {/* Net Salary */}
          <div className="p-4 bg-green-100 rounded-lg text-center border-2 border-green-200">
            <div className="text-sm text-green-700 font-medium">Net Salary</div>
            <div className="text-2xl font-bold text-green-800">
              {formatPrice(netSalary)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Final amount to pay (Gross - Loans - Deductions)
            </div>
          </div>
        </div>

        <QuickSummaryCards
          calculation={calculation}
          totalDeductions={totalDeductions}
          totalLoans={totalLoans}
          totalBonuses={totalBonuses}
        />

        <LoanInformation
          calculation={calculation}
          selectedMonth={selectedMonth}
        />

        {/* Expandable Content */}
        {isExpanded && (
          <div className="space-y-4 flex-1">
            <SalaryBreakdownAccordion
              calculation={calculation}
              selectedMonth={selectedMonth}
              employeeDeductions={employeeDeductions}
              employeeLoans={employeeLoans}
              employeeBonuses={employeeBonuses}
              totalDeductionsAndLoans={totalDeductionsAndLoans}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
