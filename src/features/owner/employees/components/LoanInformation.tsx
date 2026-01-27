import { format } from 'date-fns';
import React from 'react';

import type { SalaryCalculation } from '@shared/types/business/calculations';

import { formatPrice } from '@/features/owner/employees/utils/formatting';


interface LoanInformationProps {
  calculation: SalaryCalculation;
  selectedMonth: string;
}

export const LoanInformation: React.FC<LoanInformationProps> = ({
  calculation,
  selectedMonth,
}): JSX.Element | null => {
  // Only show if there are loans
  if (calculation.loans <= 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-orange-700">
          💰 Loan Deduction
        </div>
        <div className="text-sm font-bold text-orange-800">
          -{formatPrice(calculation.loans)}
        </div>
      </div>
      <div className="text-xs text-orange-600 mt-1">
        Automatically deducted from salary for{' '}
        {format(new Date(selectedMonth), 'MMM yyyy')}
      </div>
    </div>
  );
};
