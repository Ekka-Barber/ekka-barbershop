interface BonusesTabHeaderProps {
  selectedMonth: string;
}

export const BonusesTabHeader: React.FC<BonusesTabHeaderProps> = ({
  selectedMonth,
}) => {
  return (
    <div className="text-center mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Employee Bonuses Management
      </h2>
      <p className="text-sm text-muted-foreground">
        Manage bonuses for{' '}
        {selectedMonth
          ? new Date(selectedMonth).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })
          : 'current month'}
      </p>
    </div>
  );
};
