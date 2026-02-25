import { Award, Trophy, Medal } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

interface TopPerformer {
  id: string;
  name: string;
  name_ar?: string;
  sales: number;
}

interface TopPerformersProps {
  performers: TopPerformer[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' ر.س';
};

const getMedalIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return null;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-l from-yellow-50 to-amber-50 border-yellow-200';
    case 2:
      return 'bg-gradient-to-l from-gray-50 to-slate-50 border-gray-200';
    case 3:
      return 'bg-gradient-to-l from-amber-50 to-orange-50 border-amber-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const TopPerformers = ({ performers }: TopPerformersProps) => {
  if (performers.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          أفضل المبيعات
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {performers.map((performer, index) => {
          const rank = index + 1;
          const displayName = performer.name_ar || performer.name;

          return (
            <div
              key={performer.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getRankBg(rank)}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                  {getMedalIcon(rank)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">
                    المركز {rank === 1 ? 'الأول' : rank === 2 ? 'الثاني' : 'الثالث'}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">{formatCurrency(performer.sales)}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
