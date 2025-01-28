import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Slash } from "lucide-react";

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
}

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
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
  selectedBarberName
}: BookingSummaryProps) => {
  const { t, language } = useLanguage();
  
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  const formatPrice = (price: number) => {
    const roundedPrice = roundPrice(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-medium">{t('booking.summary')}</h3>
      
      <div className="space-y-2 text-sm">
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between items-center">
              <span>{service.name}</span>
              <div className="flex items-center gap-2">
                {service.originalPrice && (
                  <span className="flex items-center relative">
                    <Slash className="w-4 h-4 text-destructive absolute -translate-y-[2px]" />
                    <span className="text-muted-foreground">{formatPrice(service.originalPrice)}</span>
                  </span>
                )}
                <span>{formatPrice(service.price)}</span>
              </div>
            </div>
          ))}
        </div>

        {totalDuration > 0 && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{t('total.duration')}</span>
            <span>{totalDuration} {t('minutes')}</span>
          </div>
        )}
        
        {selectedDate && selectedTime && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{t('date.time')}</span>
            <span>{format(selectedDate, 'dd/MM/yyyy')} - {selectedTime}</span>
          </div>
        )}

        {selectedBarberName && (
          <div className="pt-2 flex justify-between text-muted-foreground">
            <span>{t('barber')}</span>
            <span>{selectedBarberName}</span>
          </div>
        )}

        {totalDiscount > 0 && (
          <div className="pt-2 flex justify-between text-destructive">
            <span>{t('discount')}</span>
            <span>- {formatPrice(totalDiscount)}</span>
          </div>
        )}
        
        <div className="border-t pt-2 font-medium flex justify-between">
          <span>{t('total')}</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
};