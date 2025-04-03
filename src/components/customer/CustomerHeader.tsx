
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerHeaderProps {
  language: string;
}

export const CustomerHeader = ({ language }: CustomerHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="text-center flex-shrink-0 mx-auto pt-safe">
      <img 
        src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png" 
        alt="Ekka Barbershop Logo" 
        className="h-28 md:h-32 mx-auto mb-4 md:mb-6 object-contain"
        loading="eager"
        width="320" 
        height="128"
      />
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-xl font-medium text-[#222222]">
          {t('welcome.line1')}
        </h2>
        <h1 className="text-2xl md:text-3xl font-bold text-[#222222]">
          {t('welcome.line2')}
        </h1>
      </div>
      <div className="h-1 w-24 bg-[#C4A36F] mx-auto mt-3 md:mt-4 mb-6"></div>
    </div>
  );
};
