
import { useState, useEffect } from 'react';
import { CustomerDetails } from '@/types/booking';

export const useCustomerDetails = () => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  // Validate customer details
  const validateCustomerDetails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^05\d{8}$/;
    
    const isNameValid = customerDetails.name.trim() !== '';
    const isPhoneValid = phoneRegex.test(customerDetails.phone);
    const isEmailValid = emailRegex.test(customerDetails.email);
    
    return isNameValid && isPhoneValid && isEmailValid;
  };
  
  // Validate form whenever customer details change
  useEffect(() => {
    setIsFormValid(validateCustomerDetails());
  }, [customerDetails]);

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
    handleCustomerDetailsChange,
    isFormValid
  };
};
