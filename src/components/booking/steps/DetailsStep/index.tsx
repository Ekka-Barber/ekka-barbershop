
import { CustomerSection } from './CustomerSection';
import { SummarySection } from './SummarySection';
import { WhatsAppSection } from './WhatsAppSection';
import { CustomerDetails, Branch } from '@/types/booking';
import { SelectedService } from '@/types/service';

interface DetailsStepProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  onRemoveService: (serviceId: string) => void;
  language: string;
  branch?: Branch;
}

export const DetailsStep = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  onCustomerDetailsChange,
  onRemoveService,
  language,
  branch
}: DetailsStepProps) => {
  return (
    <div className="space-y-6">
      <CustomerSection
        customerDetails={customerDetails}
        onCustomerDetailsChange={onCustomerDetailsChange}
      />
      <SummarySection
        selectedServices={selectedServices}
        totalPrice={totalPrice}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedBarberName={selectedBarberName}
        onRemoveService={onRemoveService}
      />
      <WhatsAppSection
        selectedServices={selectedServices}
        totalPrice={totalPrice}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedBarberName={selectedBarberName}
        customerDetails={customerDetails}
        language={language}
        branch={branch}
      />
    </div>
  );
};
