
import { useState } from 'react';
import { CustomerDetails } from '@/types/booking';

export const useCustomerDetails = () => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  /**
   * Updates a specific field in the customer details
   */
  const handleCustomerDetailsChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    customerDetails,
    setCustomerDetails,
    handleCustomerDetailsChange
  };
};
