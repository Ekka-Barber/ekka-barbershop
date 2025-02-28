
import { Button } from "@/components/ui/button";
import { SelectedService } from "@/types/service";
import { formatDuration, formatNumber } from "@/utils/formatters";
import { Language } from "@/types/language";
import { PriceDisplay } from "@/components/ui/price-display";

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
    <div className={`border-t mt-auto pt-4 px-4 bg-white ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">
          {language === 'ar' ? 'الخدمات المختارة' : 'Selected Services'}
          <span className="text-muted-foreground ml-1">
            ({selectedServices.length} {language === 'ar' ? 'خدمات' : 'services'})
          </span>
        </div>
        <div className="max-h-20 overflow-y-auto hide-scrollbar">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between text-sm py-1">
              <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
              <PriceDisplay 
                price={service.price}
                language={language}
                size="sm"
              />
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
          <PriceDisplay 
            price={totalPrice}
            language={language}
            size="lg"
          />
        </div>
      </div>
      
      <Button 
        onClick={onNextStep} 
        className="w-full bg-[#C4A484] hover:bg-[#b3957b]"
      >
        {language === 'ar' ? 'متابعة' : 'Continue'}
      </Button>
    </div>
  );
};
