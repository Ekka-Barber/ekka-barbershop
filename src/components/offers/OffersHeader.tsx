
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";

interface OffersHeaderProps {
  onBackClick: () => void;
}

export const OffersHeader = ({ onBackClick }: OffersHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center mb-8">
      <Link to="/customer" className="transition-opacity hover:opacity-80">
        <img 
          src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
          alt="Ekka Barbershop Logo" 
          className="h-24 mb-6 object-contain cursor-pointer"
        />
      </Link>
      <h1 className="text-3xl font-bold text-[#222222] mb-2">{t('special.offers.title')}</h1>
      <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-6"></div>
      <Button 
        onClick={() => {
          trackButtonClick('Back Home');
          onBackClick();
        }}
        className="bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300"
      >
        {t('back.home')}
      </Button>
    </div>
  );
};
