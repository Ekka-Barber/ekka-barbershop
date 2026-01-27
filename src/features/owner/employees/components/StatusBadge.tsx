import React from 'react';

import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui/components/badge';

interface StatusBadgeProps {
  status: 'valid' | 'expiring_soon' | 'expired' | 'needs_renewal';
  daysRemaining?: number;
  className?: string;
}

const STATUS_CONFIG = {
  valid: {
    label: 'Valid',
    variant: 'default' as const,
    className: 'bg-success/15 text-success hover:bg-success/20',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    variant: 'secondary' as const,
    className: 'bg-warning/15 text-warning hover:bg-warning/20',
  },
  expired: {
    label: 'Expired',
    variant: 'destructive' as const,
    className: 'bg-destructive/15 text-destructive hover:bg-destructive/20',
  },
  needs_renewal: {
    label: 'Needs Renewal',
    variant: 'outline' as const,
    className: 'bg-info/15 text-info hover:bg-info/20',
  },
} as const;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  daysRemaining,
  className,
}) => {
  const config = STATUS_CONFIG[status];

  const getDisplayText = () => {
    if (daysRemaining !== undefined) {
      if (daysRemaining < 0) {
        return `Expired (${Math.abs(daysRemaining)} days ago)`;
      } else if (daysRemaining === 0) {
        return 'Expires today';
      } else if (status === 'expiring_soon') {
        return `${daysRemaining} days left`;
      }
    }
    return config.label;
  };

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {getDisplayText()}
    </Badge>
  );
};
