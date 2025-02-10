
import { BookingContainer } from "@/components/booking/BookingContainer";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Bookings = () => {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <BookingContainer />
        </div>
        <footer className="page-footer" />
      </div>
    </LanguageProvider>
  );
};

export default Bookings;
