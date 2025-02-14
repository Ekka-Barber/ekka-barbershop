
import { BookingContainer } from "@/components/booking/BookingContainer";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Bookings = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <BookingContainer />
        <footer className="page-footer" />
      </div>
    </LanguageProvider>
  );
};

export default Bookings;
