import React from 'react';

import type { SalaryCalculation } from '@shared/types/business';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

import { formatPrice } from '@/features/owner/employees/utils/formatting';


interface BranchSalaryTotalsCardProps {
  calculations: SalaryCalculation[];
  employees?: Array<{
    id: string;
    name: string;
    name_ar?: string;
    branches?: { name: string; name_ar?: string } | null;
    sponsor_id?: string | null;
    sponsors?: { name_ar?: string | null } | null;
  }>;
}

interface BranchTotal {
  branchName: string;
  branchNameAr?: string;
  totalAfterDeductions: number;
  employeeCount: number;
}

export const BranchSalaryTotalsCard: React.FC<BranchSalaryTotalsCardProps> = ({
  calculations,
  employees = [],
}) => {
  // Calculate totals by branch
  const branchTotals = React.useMemo(() => {
    const totalsMap = new Map<string, BranchTotal>();

    calculations.forEach((calc) => {
      // Find the employee to get branch information
      const employee = employees.find((emp) => emp.name === calc.employeeName);
      const branchName = employee?.branches?.name || 'Unassigned';
      const branchNameAr = employee?.branches?.name_ar;

      // Salary after direct deductions but before loan repayment
      const grossSalary =
        calc.basicSalary +
        calc.commission +
        calc.targetBonus +
        calc.extraBonuses;
      const salaryAfterDeductions = grossSalary - calc.deductions;

      if (totalsMap.has(branchName)) {
        const existing = totalsMap.get(branchName)!;
        existing.totalAfterDeductions += salaryAfterDeductions;
        existing.employeeCount += 1;
      } else {
        totalsMap.set(branchName, {
          branchName,
          branchNameAr,
          totalAfterDeductions: salaryAfterDeductions,
          employeeCount: 1,
        });
      }
    });

    // Convert to array and sort by total gross descending
    return Array.from(totalsMap.values()).sort(
      (a, b) => b.totalAfterDeductions - a.totalAfterDeductions
    );
  }, [calculations, employees]);

  if (branchTotals.length === 0) {
    return null;
  }

  return (
    <Card className="mx-4 bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-blue-900">
          Total Salaries After Deductions (Before Loans) by Branch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {branchTotals.map((branch) => (
            <div
              key={branch.branchName}
              className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-blue-100"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {branch.branchName}
                  {branch.branchNameAr && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({branch.branchNameAr})
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {branch.employeeCount} employee{branch.employeeCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-lg font-bold text-blue-800">
                {formatPrice(branch.totalAfterDeductions)}
              </div>
            </div>
          ))}

          {/* Total across all branches */}
          <div className="border-t border-blue-200 pt-3 mt-4">
            <div className="flex justify-between items-center py-2 px-3 bg-blue-100 rounded-md">
              <div className="font-semibold text-blue-900">
                Total All Branches
              </div>
              <div className="text-xl font-bold text-blue-900">
                {formatPrice(
                  branchTotals.reduce(
                    (sum, branch) => sum + branch.totalAfterDeductions,
                    0
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
