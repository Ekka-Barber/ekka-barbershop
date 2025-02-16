
import { Skeleton } from "@/components/ui/skeleton";

export const ServiceCategorySkeleton = () => {
  return (
    <div className="space-y-4">
      {Array(3).fill(0).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="p-3 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
          <div className="ml-8 space-y-2">
            {Array(2).fill(0).map((_, serviceIndex) => (
              <Skeleton
                key={serviceIndex}
                className="h-16 w-full rounded-lg"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
