import { Skeleton } from "@/components/ui/skeleton";

export const ServicesSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex overflow-x-auto pb-2 hide-scrollbar">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-10 w-32 mx-1 flex-shrink-0 rounded-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/50 to-transparent bg-[length:200%_100%]" 
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-3/4 animate-shimmer bg-gradient-to-r from-transparent via-gray-200/50 to-transparent bg-[length:200%_100%]" />
            <Skeleton className="h-4 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-gray-200/50 to-transparent bg-[length:200%_100%]" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-4 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-gray-200/50 to-transparent bg-[length:200%_100%]" />
              <Skeleton className="h-8 w-8 rounded-full animate-shimmer bg-gradient-to-r from-transparent via-gray-200/50 to-transparent bg-[length:200%_100%]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
