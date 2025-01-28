import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
}

export const BookingSummary = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName
}: BookingSummaryProps) => {
  const { t } = useLanguage();
  
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.duration, 0);

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-medium">{t('booking.summary')}</h3>
      
      <div className="space-y-2 text-sm">
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex justify-between">
              <span>{service.name}</span>
              <span>{service.price} SAR</span>
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
        
        <div className="border-t pt-2 font-medium flex justify-between">
          <span>{t('total')}</span>
          <span>{totalPrice} SAR</span>
        </div>
      </div>
    </div>
  );
};