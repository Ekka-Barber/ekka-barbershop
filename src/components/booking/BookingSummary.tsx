
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Slash, X, Tag } from "lucide-react";
import { SelectedService } from "@/types/service";
import { PriceDisplay } from "@/components/ui/price-display";
import { CustomerDetails } from "@/types/booking";

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails?: CustomerDetails;
  branch?: any;
  onRemoveService?: (serviceId: string) => void;
}

const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};

export const BookingSummary = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  branch,
  onRemoveService
}: BookingSummaryProps) => {
  const { t, language } = useLanguage();
  
  const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 0), 0);
  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  const getArabicTimeUnit = (duration: number) => {
    return duration >= 5 && duration <= 10 ? 'دقائق' : 'دقيقة';
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-medium">{language === 'ar' ? 'ملخص الحجز' : t('booking.summary')}</h3>
      
      <div className="space-y-2 text-sm">
        {selectedServices.length > 0 ? (
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
                  {onRemoveService && service.isUpsellItem && (
                    <button
                      onClick={() => onRemoveService(service.id)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Remove service"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {service.originalPrice && service.originalPrice > service.price && (
                    <div className="flex items-center gap-1">
                      <PriceDisplay 
                        price={service.originalPrice} 
                        language={language as 'en' | 'ar'} 
                        size="sm"
                        className="text-muted-foreground relative"
                      />
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-destructive" />
                        {service.discountPercentage && (
                          <span className="text-xs text-destructive">-{service.discountPercentage}%</span>
                        )}
                      </div>
                    </div>
                  )}
                  <PriceDisplay 
                    price={service.price} 
                    language={language as 'en' | 'ar'} 
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-2">
            {language === 'ar' ? 'لم يتم اختيار أي خدمات' : 'No services selected'}
          </div>
        )}

        {totalDuration > 0 && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{language === 'ar' ? 'المدة الإجمالية' : t('total.duration')}</span>
            <span>{totalDuration} {language === 'ar' 
              ? getArabicTimeUnit(totalDuration)
              : t('minutes')}</span>
          </div>
        )}
        
        {selectedDate && selectedTime && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{language === 'ar' ? 'التاريخ والوقت' : t('date.time')}</span>
            <span>{format(selectedDate, 'dd/MM/yyyy')} - {selectedTime}</span>
          </div>
        )}

        {selectedBarberName && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{language === 'ar' ? 'الحلاق' : t('barber')}</span>
            <span>{selectedBarberName}</span>
          </div>
        )}

        {totalDiscount > 0 && (
          <div className="pt-2 flex justify-between text-destructive items-center">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{language === 'ar' ? 'الخصم' : t('discount')}</span>
            </div>
            <PriceDisplay 
              price={totalDiscount} 
              language={language as 'en' | 'ar'}
              size="sm"
              className="text-destructive"
            />
          </div>
        )}
        
        <div className="border-t pt-2 font-medium flex justify-between">
          <span>{language === 'ar' ? 'المجموع' : t('total')}</span>
          <PriceDisplay 
            price={totalPrice} 
            language={language as 'en' | 'ar'}
            size="base"
          />
        </div>
      </div>
    </div>
  );
};
