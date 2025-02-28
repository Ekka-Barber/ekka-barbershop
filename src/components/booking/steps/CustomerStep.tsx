
import { CustomerForm } from "../CustomerForm";
import { CustomerDetails } from "@/types/booking";
import { useState } from "react";

interface CustomerStepProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  branch: any;
  onTermsAcceptanceChange?: (accepted: boolean) => void;
  termsAccepted?: boolean;
}

const CustomerStep: React.FC<CustomerStepProps> = ({
  customerDetails,
  onCustomerDetailsChange,
  branch,
  onTermsAcceptanceChange,
  termsAccepted = false
}) => {
  const [isFormValid, setIsFormValid] = useState(false);

  const handleValidationChange = (isValid: boolean) => {
    setIsFormValid(isValid);
  };

  return (
    <div className="space-y-6">
      <CustomerForm
        customerDetails={customerDetails}
        onCustomerDetailsChange={onCustomerDetailsChange}
        branch={branch}
        onValidationChange={handleValidationChange}
        onTermsAcceptanceChange={onTermsAcceptanceChange}
        termsAccepted={termsAccepted}
      />
    </div>
  );
};

export default CustomerStep;
