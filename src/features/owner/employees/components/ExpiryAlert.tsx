import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import React from 'react';

import { TIME } from '@shared/constants/time';
import { cn } from '@shared/lib/utils';
import { Alert, AlertDescription } from '@shared/ui/components/alert';

interface ExpiryAlertProps {
  daysRemaining: number;
  documentName: string;
  employeeName: string;
  className?: string;
}

export const ExpiryAlert: React.FC<ExpiryAlertProps> = ({
  daysRemaining,
  documentName,
  employeeName,
  className,
}) => {
  const getAlertConfig = () => {
    if (daysRemaining < 0) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Document Expired',
        message: `${documentName} for ${employeeName} expired ${Math.abs(daysRemaining)} days ago`,
        className: 'border-red-200 bg-red-50',
      };
    } else if (daysRemaining === 0) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Document Expires Today',
        message: `${documentName} for ${employeeName} expires today`,
        className: 'border-red-200 bg-red-50',
      };
    } else if (daysRemaining <= TIME.DAYS_PER_WEEK) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        title: 'Document Expiring Soon',
        message: `${documentName} for ${employeeName} expires in ${daysRemaining} days`,
        className: 'border-orange-200 bg-orange-50',
      };
    } else if (daysRemaining <= TIME.DAYS_PER_MONTH_APPROX) {
      return {
        variant: 'default' as const,
        icon: Clock,
        title: 'Document Expiring',
        message: `${documentName} for ${employeeName} expires in ${daysRemaining} days`,
        className: 'border-yellow-200 bg-yellow-50',
      };
    } else {
      return {
        variant: 'default' as const,
        icon: CheckCircle,
        title: 'Document Valid',
        message: `${documentName} for ${employeeName} is valid for ${daysRemaining} more days`,
        className: 'border-green-200 bg-green-50',
      };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={cn(config.className, className)}>
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <div>
          <p className="font-medium">{config.title}</p>
          <p className="text-sm">{config.message}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
