
import { BookingContainer } from "@/components/booking/BookingContainer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import AppLayout from '@/components/layout/AppLayout';

const Bookings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading for better user experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  const handleError = (error: Error) => {
    toast({
      title: "An error occurred",
      description: "We encountered an issue while loading the booking interface. Please try again.",
      variant: "destructive"
    });
  };

  return (
    <AppLayout>
      <ErrorBoundary onError={handleError}>
        {isLoading ? (
          <div className="w-full flex flex-1 items-center justify-center max-w-md mx-auto">
            <SkeletonLoader />
          </div>
        ) : (
          <div className="w-full flex flex-1 items-center justify-center max-w-md mx-auto">
            <BookingContainer />
          </div>
        )}
      </ErrorBoundary>
    </AppLayout>
  );
};

export default Bookings;
