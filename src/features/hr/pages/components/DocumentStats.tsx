import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import React from 'react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import { Card, CardContent } from '@shared/ui/components/card';

interface DocumentStatsProps {
  totalDocuments: number;
  validDocuments: number;
  expiringSoonDocuments: number;
  expiredDocuments: number;
}

export const DocumentStats: React.FC<DocumentStatsProps> = ({
  totalDocuments,
  validDocuments,
  expiringSoonDocuments,
  expiredDocuments,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const stats = [
    {
      id: 'total',
      label: 'إجمالي المستندات',
      value: totalDocuments,
      icon: FileText,
      color: 'from-[#fff3db] to-[#fff9ef]',
      textColor: 'text-[#7a5621]',
      borderColor: 'border-[#ecd9b7]',
    },
    {
      id: 'valid',
      label: 'مستندات سارية',
      value: validDocuments,
      icon: CheckCircle,
      color: 'from-[#f0fdf4] to-[#f0fdf4]',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'expiring',
      label: 'تنتهي خلال 30 يوم',
      value: expiringSoonDocuments,
      icon: Clock,
      color: 'from-[#fffbeb] to-[#fffbeb]',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    {
      id: 'expired',
      label: 'مستندات منتهية',
      value: expiredDocuments,
      icon: AlertTriangle,
      color: 'from-[#fef2f2] to-[#fef2f2]',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.28,
              delay: shouldReduceMotion ? 0 : index * 0.05,
              ease: 'easeOut',
            }}
          >
            <Card
              className={`border ${stat.borderColor} bg-gradient-to-br ${stat.color} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 border ${stat.borderColor}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#7a684e]">{stat.label}</p>
                    <p
                      className={`text-2xl font-semibold ${stat.textColor} mt-0.5`}
                    >
                      {stat.value.toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
