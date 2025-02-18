
import { BookingSummary } from '@/components/booking/BookingSummary';
import { SelectedService } from '@/types/service';

interface SummarySectionProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  onRemoveService: (serviceId: string) => void;
}

export const SummarySection = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  onRemoveService
}: SummarySectionProps) => {
  return (
    <BookingSummary
      selectedServices={selectedServices}
      totalPrice={totalPrice}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarberName={selectedBarberName}
      onRemoveService={onRemoveService}
    />
  );
};
