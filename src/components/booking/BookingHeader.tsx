
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface BookingHeaderProps {
  branchName: string | undefined;
  branchAddress: string | undefined;
  isLoading: boolean;
}

export const BookingHeader = ({ branchName, branchAddress, isLoading }: BookingHeaderProps) => {
  const { t, language } = useLanguage();
  
  return (
    <div className="text-center">
      <div className="sticky top-0 z-50 bg-gradient-to-b from-gray-50 to-transparent py-2 px-4">
        <LanguageSwitcher />
      </div>
      <Link to="/customer">
        <img 
          src="/lovable-uploads/8289fb1d-c6e6-4528-980c-6b52313ca898.png"
          alt="Ekka Barbershop Logo" 
          className="h-32 mx-auto mb-6 cursor-pointer hover:opacity-90 transition-opacity"
        />
      </Link>
      <h1 className="text-3xl font-bold text-[#222222] mb-2">
        {t('book.appointment')}
      </h1>
      <div className="h-1 w-24 bg-[#C4A36F] mx-auto mb-4"></div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      ) : branchName && (
        <div className="text-lg text-gray-600 mb-6">
          {language === 'ar' ? branchName : branchName}
          <br />
          <span className="text-sm text-gray-500">
            {language === 'ar' ? branchAddress : branchAddress}
          </span>
        </div>
      )}
    </div>
  );
};
