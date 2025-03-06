
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Service categories skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-md space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Date/time skeleton */}
      <div className="space-y-4 mt-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex flex-wrap gap-2">
          {Array(7).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-11 w-11 rounded-md" />
          ))}
        </div>
        
        <Skeleton className="h-8 w-40 mt-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};
