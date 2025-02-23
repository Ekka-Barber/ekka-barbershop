
import { Skeleton } from "@/components/ui/skeleton";

export const DateTimeSelectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton 
            key={i} 
            className="h-20 w-full rounded-lg shimmer" 
          />
        ))}
      </div>
      <div className="mt-8">
        <div className="w-full">
          <div className="bg-gradient-to-b from-white to-gray-50 shadow-sm border border-gray-100 rounded-lg">
            <div className="overflow-x-auto scrollbar-hide px-4 py-4">
              <div className="flex space-x-3">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="h-10 w-20 flex-shrink-0 rounded shimmer" 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

