
import { BookingContainer } from "@/components/booking/BookingContainer";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Bookings = () => {
  return (
    <LanguageProvider>
      <BookingContainer />
    </LanguageProvider>
  );
};

export default Bookings;
