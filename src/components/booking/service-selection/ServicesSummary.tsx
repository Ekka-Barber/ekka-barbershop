
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertToArabic } from "@/utils/arabicNumerals";
import { formatDuration } from "@/utils/formatters";
import { PriceDisplay } from "@/components/ui/price-display";

interface ServicesSummaryProps {
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  language: string;
  onNextStep: () => void;
}

export const ServicesSummary = ({
  selectedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep
}: ServicesSummaryProps) => {
  if (selectedServices.length === 0) return null;

  const servicesCount = language === 'ar' 
    ? `${convertToArabic(selectedServices.length.toString())} خدمات`
    : `${selectedServices.length} services`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2.5 shadow-lg">
      <div className={`flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="space-y-1">
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-medium">{servicesCount}</span>
            <span className="text-gray-500">•</span>
            <span className={`flex items-center gap-1 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Timer className="w-4 h-4" />
              {formatDuration(totalDuration, language as 'en' | 'ar')}
            </span>
            <span className="text-gray-500">•</span>
            <div className={language === 'ar' ? 'rtl' : 'ltr'}>
              <PriceDisplay 
                price={totalPrice}
                language={language as 'en' | 'ar'}
                size="base"
              />
            </div>
          </div>
        </div>
        <Button 
          className="bg-[#e7bd71] hover:bg-[#d4ad65]"
          onClick={onNextStep}
          disabled={selectedServices.length === 0}
        >
          {language === 'ar' ? 'التالي' : 'Next'}
        </Button>
      </div>
    </div>
  );
};
