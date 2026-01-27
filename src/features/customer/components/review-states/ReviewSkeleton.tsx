
import { Skeleton } from '@shared/ui/components/skeleton';

export const ReviewSkeleton = () => (
  <div className="flex-grow-0 flex-shrink-0 basis-[90%] sm:basis-[45%] md:basis-[31%] pl-4">
    <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col border border-gray-100">
      <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16 mb-2" />
          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-4 h-4 mx-0.5" />)}
          </div>
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);
