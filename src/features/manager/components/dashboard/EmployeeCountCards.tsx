import { UserCheck, UserX, Users } from 'lucide-react';

import { Card, CardContent } from '@shared/ui/components/card';

interface EmployeeCountCardsProps {
  total: number;
  active: number;
  onLeave: number;
}

export const EmployeeCountCards = ({ total, active, onLeave }: EmployeeCountCardsProps) => {
  const cards = [
    {
      title: 'إجمالي الموظفين',
      value: total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'الموظفين النشطين',
      value: active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'في إجازة',
      value: onLeave,
      icon: UserX,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
