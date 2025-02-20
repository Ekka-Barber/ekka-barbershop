import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { convertToArabic } from "@/utils/arabicNumerals";

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
  const getArabicTimeUnit = (duration: number) => {
    return duration >= 5 && duration <= 10 ? 'دقائق' : 'دقيقة';
  };

  const formatPrice = (price: number) => {
    const roundedPrice = Math.floor(price);
    const formattedNumber = language === 'ar' 
      ? convertToArabic(roundedPrice.toString())
      : roundedPrice.toString();
    
    return (
      <span className="inline-flex items-center gap-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {formattedNumber}
        <RiyalIcon />
      </span>
    );
  };

  if (selectedServices.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2.5 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {language === 'ar' 
                ? `${convertToArabic(selectedServices.length.toString())} خدمات`
                : `${selectedServices.length} services`}
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {language === 'ar'
                ? `${convertToArabic(totalDuration.toString())} ${getArabicTimeUnit(totalDuration)}`
                : `${totalDuration} min`}
            </span>
            <span className="text-gray-500">•</span>
            <span>{formatPrice(totalPrice)}</span>
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
