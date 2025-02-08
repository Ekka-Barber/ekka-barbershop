
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  if (selectedServices.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {selectedServices.length} {language === 'ar' ? 'خدمات' : 'services'}
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {totalDuration} {language === 'ar' 
                ? getArabicTimeUnit(totalDuration)
                : 'min'}
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
