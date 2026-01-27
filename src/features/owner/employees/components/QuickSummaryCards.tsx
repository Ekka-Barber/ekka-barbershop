import React from 'react';

import { formatPrice } from '@shared/utils/currency';

interface QuickSummaryCardsProps {
  totalBonuses: number;
  totalDeductions: number;
}

export const QuickSummaryCards: React.FC<QuickSummaryCardsProps> = ({
  totalBonuses,
  totalDeductions,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-success/10 p-3 rounded-lg text-center">
        <div className="text-xs text-success font-medium">Bonuses</div>
        <div className="text-sm font-bold text-success">
          {formatPrice(totalBonuses)}
        </div>
      </div>
      <div className="bg-destructive/10 p-3 rounded-lg text-center">
        <div className="text-xs text-destructive font-medium">Deductions</div>
        <div className="text-sm font-bold text-destructive">
          {formatPrice(totalDeductions)}
        </div>
      </div>
    </div>
  );
};
