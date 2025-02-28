
import { CustomerForm } from "../CustomerForm";
import { CustomerDetails } from "@/types/booking";

interface CustomerStepProps {
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: string, value: string) => void;
  branch: any;
}

export const CustomerStep = ({
  customerDetails,
  handleCustomerDetailsChange,
  branch
}: CustomerStepProps) => {
  return (
    <CustomerForm
      customerDetails={customerDetails}
      onCustomerDetailsChange={handleCustomerDetailsChange}
      branch={branch}
    />
  );
};
