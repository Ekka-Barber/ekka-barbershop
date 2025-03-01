
import { Skeleton } from "@/components/ui/skeleton";

export const DateTimeSelectionSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="h-20 rounded-md border border-gray-200 p-2">
            <div className="flex flex-col items-center justify-center space-y-2 h-full">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-6 w-28 mx-auto" />
    </div>
  );
};
