import { useLanguage } from "@/contexts/LanguageContext";

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
}

export const BookingSummary = ({
  selectedServices,
  totalPrice
}: BookingSummaryProps) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="font-medium">{t('booking.summary')}</h3>
      
      <div className="space-y-2 text-sm">
        {selectedServices.map((service) => (
          <div key={service.id} className="flex justify-between">
            <span>{service.name}</span>
            <span>{service.price} SAR</span>
          </div>
        ))}
        
        <div className="border-t pt-2 font-medium flex justify-between">
          <span>{t('total')}</span>
          <span>{totalPrice} SAR</span>
        </div>
      </div>
    </div>
  );
};