
import { CustomerForm } from "../CustomerForm";
import { CustomerDetails } from "@/hooks/booking/useBookingState";

interface CustomerStepProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: string, value: string) => void;
  branch: any;
}

const CustomerStep: React.FC<CustomerStepProps> = ({
  customerDetails,
  onCustomerDetailsChange,
  branch
}) => {
  return (
    <div className="space-y-6">
      <CustomerForm
        customerDetails={customerDetails}
        onCustomerDetailsChange={onCustomerDetailsChange}
        branch={branch}
      />
    </div>
  );
};

export default CustomerStep;
