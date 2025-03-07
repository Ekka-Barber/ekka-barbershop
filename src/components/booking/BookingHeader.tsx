
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Branch } from "@/types/booking";

export interface BookingHeaderProps {
  branchName?: string;
  branchAddress?: string;
  isLoading: boolean;
  branch?: Branch;
  onBranchSelect?: (branchId: string) => void;
}

export const BookingHeader = ({ 
  branchName, 
  branchAddress, 
  isLoading,
  branch,
  onBranchSelect
}: BookingHeaderProps) => {
  const { t, language } = useLanguage();
  
  // Use branch object properties if direct props are not provided
  const displayName = branchName || (branch ? (language === 'ar' ? branch.name_ar || branch.name : branch.name) : '');
  const displayAddress = branchAddress || (branch ? (language === 'ar' ? branch.address_ar || branch.address : branch.address) : '');
  
  return (
    <div className="text-center mb-8">
      <Link to="/customer" className="transition-opacity hover:opacity-80 block">
        <img 
          src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png"
          alt="Ekka Barbershop Logo" 
          className="h-24 mb-6 object-contain mx-auto w-auto"
          loading="eager"
          width="240"
          height="96"
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
      ) : displayName && (
        <div className="text-lg text-gray-600 mb-6">
          {displayName}
          <br />
          <span className="text-sm text-gray-500">
            {displayAddress}
          </span>
        </div>
      )}
    </div>
  );
};
