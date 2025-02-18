
import { Skeleton } from "@/components/ui/skeleton";

export const ServiceCardSkeleton = () => {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center justify-between mt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};
