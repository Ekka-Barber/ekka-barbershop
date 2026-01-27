import React from 'react';

import type { SalaryCalculation } from '@shared/types/business/calculations';

import { formatPrice } from '@/features/owner/employees/utils/formatting';


interface QuickSummaryCardsProps {
  calculation: SalaryCalculation;
  totalDeductions: number;
  totalLoans: number;
  totalBonuses: number;
}

export const QuickSummaryCards: React.FC<QuickSummaryCardsProps> = ({
  calculation,
  totalDeductions,
  totalLoans,
  totalBonuses,
}): JSX.Element => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="bg-green-50 p-3 rounded-lg text-center">
        <div className="text-xs text-green-600 font-medium">Sales</div>
        <div className="text-sm font-bold text-green-700">
          {formatPrice(calculation.sales)}
        </div>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg text-center">
        <div className="text-xs text-blue-600 font-medium">Base Salary</div>
        <div className="text-sm font-bold text-blue-700">
          {formatPrice(calculation.basicSalary)}
        </div>
      </div>
      <div className="bg-purple-50 p-3 rounded-lg text-center">
        <div className="text-xs text-purple-600 font-medium">Total Bonuses</div>
        <div className="text-sm font-bold text-purple-700">
          +{formatPrice(totalBonuses)}
        </div>
      </div>
      <div className="bg-red-50 p-3 rounded-lg text-center">
        <div className="text-xs text-red-600 font-medium">
          Deductions + Loans
        </div>
        <div className="text-sm font-bold text-red-700">
          -{formatPrice(totalDeductions + totalLoans)}
        </div>
      </div>
    </div>
  );
};
