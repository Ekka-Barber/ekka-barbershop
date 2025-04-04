
import { useState, useEffect } from 'react';
import { CustomerDetails } from '@/types/booking';
import { logger } from '@/utils/logger';
import { VALIDATION_REGEX } from '@/constants/bookingConstants';

export const useCustomerDetails = () => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  
  /**
   * Validate customer details using regex patterns from central constants
   */
  const validateCustomerDetails = () => {
    const { phone, email, name } = customerDetails;
    
    const isNameValid = name.trim() !== '';
    const isPhoneValid = VALIDATION_REGEX.phone.test(phone);
    const isEmailValid = VALIDATION_REGEX.email.test(email);
    
    // Log validation at debug level only
    logger.debug('Customer form validation states:', { 
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
    logger.debug('Customer form validity updated:', valid);
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

  /**
   * Set all customer details at once (useful for form reset or initialization)
   */
  const setCustomerDetailsAll = (details: Partial<CustomerDetails>) => {
    setCustomerDetails(prev => ({
      ...prev,
      ...details
    }));
  };

  return {
    customerDetails,
    setCustomerDetails: setCustomerDetailsAll,
    handleCustomerDetailsChange,
    isFormValid,
    validateCustomerDetails
  };
};
