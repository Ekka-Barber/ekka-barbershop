import React from 'react';

import { Skeleton } from '@shared/ui/components/skeleton';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton key="skeleton-1" className="h-64 w-full" />
        <Skeleton key="skeleton-2" className="h-64 w-full" />
        <Skeleton key="skeleton-3" className="h-64 w-full" />
        <Skeleton key="skeleton-4" className="h-64 w-full" />
        <Skeleton key="skeleton-5" className="h-64 w-full" />
        <Skeleton key="skeleton-6" className="h-64 w-full" />
      </div>
    </div>
  );
};
