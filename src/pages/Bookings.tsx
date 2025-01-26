import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Bookings = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow max-w-md mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
            alt="Ekka Barbershop Logo" 
            className="h-32 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#222222] mb-2">
            {t('book.appointment')}
          </h1>
          <div className="h-1 w-24 bg-[#C4A36F] mx-auto"></div>
        </div>

        {/* Back Button */}
        <Button 
          className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl mb-4"
          onClick={() => navigate('/customer')}
        >
          {t('back.home')}
        </Button>

        {/* Booking content placeholder */}
        <div className="text-center text-gray-600">
          {t('booking.coming.soon')}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Bookings;