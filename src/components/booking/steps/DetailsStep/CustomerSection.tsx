
import { CustomerForm } from '@/components/booking/CustomerForm';
import { CustomerDetails } from '@/types/booking';

interface CustomerSectionProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
}

export const CustomerSection = ({
  customerDetails,
  onCustomerDetailsChange
}: CustomerSectionProps) => {
  return (
    <CustomerForm
      customerDetails={customerDetails}
      onCustomerDetailsChange={onCustomerDetailsChange}
    />
  );
};
