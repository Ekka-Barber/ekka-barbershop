
import { Button } from "@/components/ui/button";
import { SelectedService } from "@/types/service";
import { formatDuration, formatNumber } from "@/utils/formatters";
import { Language } from "@/types/language";

interface ServicesSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  totalDuration: number;
  onNextStep: () => void;
  language: Language;
}

export const ServicesSummary = ({
  selectedServices,
  totalPrice,
  totalDuration,
  onNextStep,
  language
}: ServicesSummaryProps) => {
  return (
    <div className="border-t mt-auto pt-4 px-4 bg-white">
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">
          {language === 'ar' ? 'الخدمات المختارة' : 'Selected Services'}
        </div>
        <div className="max-h-20 overflow-y-auto">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between text-sm py-1">
              <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
              <span>{formatNumber(service.price, language)} SAR</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="font-semibold">
            {language === 'ar' ? 'المجموع' : 'Total'}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDuration(totalDuration, language)}
          </div>
        </div>
        <div className="text-xl font-semibold">
          {formatNumber(totalPrice, language)} SAR
        </div>
      </div>
      
      <Button 
        onClick={onNextStep} 
        className="w-full"
      >
        {language === 'ar' ? 'متابعة' : 'Continue'}
      </Button>
    </div>
  );
};
