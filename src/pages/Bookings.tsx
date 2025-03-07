
import { BookingContainer } from "@/components/booking/BookingContainer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";
import { RefactoredBookingSteps } from "@/components/booking/RefactoredBookingSteps";
import { useState, useEffect } from "react";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

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
    console.error("Booking error:", error);
    toast({
      title: "An error occurred",
      description: "We encountered an issue while loading the booking interface. Please try again.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary onError={handleError}>
        {isLoading ? (
          <div className="container mx-auto py-6 px-4 flex-grow flex items-center justify-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
            <SkeletonLoader />
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center pb-safe">
            <BookingContainer />
          </div>
        )}
      </ErrorBoundary>
      <footer className="page-footer" />
    </div>
  );
};

export default Bookings;
