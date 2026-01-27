import React from 'react';

import { DynamicField } from '@shared/types/business/calculations';
import { formatPrice } from '@shared/utils/currency';

interface FinancialSummaryProps {
  salesAmount: number;
  monthlyBonuses: DynamicField[];
  monthlyDeductions: DynamicField[];
  monthlyLoans: DynamicField[];
  totalBonuses: number;
  totalDeductions: number;
  totalLoans: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  salesAmount,
  monthlyBonuses,
  monthlyDeductions,
  monthlyLoans,
  totalBonuses,
  totalDeductions,
  totalLoans,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
        <span className="text-sm text-blue-700">Sales</span>
        <span className="font-semibold text-blue-800">
          {formatPrice(salesAmount)}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
        <span className="text-sm text-green-700">
          Bonuses ({monthlyBonuses.length})
        </span>
        <span className="font-semibold text-green-800">
          {formatPrice(totalBonuses)}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
        <span className="text-sm text-red-700">
          Deductions ({monthlyDeductions.length})
        </span>
        <span className="font-semibold text-red-800">
          -{formatPrice(totalDeductions)}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
        <span className="text-sm text-orange-700">
          Loans ({monthlyLoans.length})
        </span>
        <span className="font-semibold text-orange-800">
          -{formatPrice(totalLoans)}
        </span>
      </div>
    </div>
  );
};
