
import { WhatsAppIntegration } from '@/components/booking/WhatsAppIntegration';
import { SelectedService } from '@/types/service';
import { CustomerDetails, Branch } from '@/types/booking';

interface WhatsAppSectionProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: CustomerDetails;
  language: string;
  branch?: Branch;
}

export const WhatsAppSection = (props: WhatsAppSectionProps) => {
  return <WhatsAppIntegration {...props} />;
};
