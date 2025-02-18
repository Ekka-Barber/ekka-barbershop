
import { BookingContainer } from "@/components/booking/BookingContainer";
import { BookingProvider } from "@/contexts/BookingContext";

const Bookings = () => {
  return (
    <BookingProvider>
      <div className="min-h-screen flex flex-col">
        <BookingContainer />
        <footer className="page-footer" />
      </div>
    </BookingProvider>
  );
};

export default Bookings;
