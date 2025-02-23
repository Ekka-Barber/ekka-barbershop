
import { Skeleton } from "@/components/ui/skeleton";

export const BarberSelectionSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="relative flex flex-col items-center justify-start h-[200px] p-4 rounded-lg border">
              <Skeleton className="h-16 w-16 rounded-full shimmer mb-4" />
              <Skeleton className="h-4 w-3/4 shimmer" />
              <Skeleton className="h-4 w-1/4 shimmer mt-2" />
              <div className="absolute top-2 right-2">
                <Skeleton className="h-6 w-20 rounded-full shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

