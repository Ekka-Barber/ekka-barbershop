
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
    
    // Log validation states for debugging
    console.log('Validation states:', { 
      name: isNameValid, 
      phone: isPhoneValid, 
      email: isEmailValid,
      overall: isNameValid && isPhoneValid && isEmailValid
    });
    
    return isNameValid && isPhoneValid && isEmailValid;
  };
  
  // Validate form whenever customer details change
  useEffect(() => {
    const valid = validateCustomerDetails();
    setIsFormValid(valid);
    console.log('Form validity updated:', valid);
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
