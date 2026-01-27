import { SalaryCalculation } from '@shared/types/business';

interface SalariesTabHeaderProps {
  selectedMonth: string;
  calculations: SalaryCalculation[];
}

export const SalariesTabHeader = ({
  selectedMonth,
  calculations,
}: SalariesTabHeaderProps) => (
  <div className="text-center mb-6">
    <h2 className="text-lg font-semibold text-foreground mb-2">
      Salary Calculations
    </h2>
    <p className="text-sm text-muted-foreground">
      Calculate salaries for{' '}
      {selectedMonth
        ? new Date(selectedMonth).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        : 'current month'}
    </p>
    <p className="text-xs text-muted-foreground/80 mt-1">
      Loans are automatically deducted from salaries for the selected month
    </p>
    {calculations.length > 0 && (
      <p className="text-xs text-info mt-1">
        📝 Use &quot;Recalculate&quot; to refresh calculations with latest
        deductions, loans, and bonuses
      </p>
    )}
  </div>
);
