
import { Skeleton } from "@/components/ui/skeleton";

export const BarberSelectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            
            <div className="mt-4">
              <Skeleton className="h-6 w-36 mb-2" />
              <div className="grid grid-cols-4 gap-2">
                {Array(8).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-10 rounded-md" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
