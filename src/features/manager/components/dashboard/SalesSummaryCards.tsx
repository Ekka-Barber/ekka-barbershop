import { DollarSign, Minus, TrendingDown, TrendingUp } from 'lucide-react';

import { Card, CardContent } from '@shared/ui/components/card';

interface SalesSummaryCardsProps {
  currentMonth: number;
  previousMonth: number;
  difference: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ر.س';
};

const getCurrentMonthName = () => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[new Date().getMonth()];
};

export const SalesSummaryCards = ({
  currentMonth,
  previousMonth,
  difference,
  percentageChange,
  trend,
}: SalesSummaryCardsProps) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  const trendBgColor = trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50';

  const comparisonText = previousMonth === 0 && currentMonth > 0
    ? 'جديد'
    : trend === 'neutral'
      ? 'لا تغيير'
      : trend === 'up'
        ? `+${percentageChange}%`
        : `-${percentageChange}%`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">مبيعات {getCurrentMonthName()}</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonth)}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">مقارنة بالشهر السابق</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${trendColor}`}>{comparisonText}</p>
                {trend !== 'neutral' && previousMonth > 0 && (
                  <span className="text-sm text-gray-500">
                    ({trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{formatCurrency(difference)})
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full ${trendBgColor}`}>
              <TrendIcon className={`h-6 w-6 ${trendColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
