
import { BookingContainer } from "@/components/booking/BookingContainer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useToast } from "@/hooks/use-toast";

const Bookings = () => {
  const { toast } = useToast();

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
        <BookingContainer />
      </ErrorBoundary>
      <footer className="page-footer" />
    </div>
  );
};

export default Bookings;
