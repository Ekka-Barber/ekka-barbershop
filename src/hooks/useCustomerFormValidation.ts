
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerDetails } from '@/types/booking';
import { logger } from '@/utils/logger';
import { useLanguage } from '@/contexts/LanguageContext';

// Define the schema using Zod
const createCustomerSchema = (language: string) => {
  const messages = {
    nameRequired: language === 'ar' ? 'الاسم مطلوب' : 'Name is required',
    phoneRequired: language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required',
    phoneInvalid: language === 'ar' 
      ? 'رقم الهاتف يجب أن يكون 10 أرقام ويبدأ بـ 05' 
      : 'Phone number must be 10 digits starting with 05',
    emailRequired: language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required',
    emailInvalid: language === 'ar' 
      ? 'صيغة البريد الإلكتروني غير صحيحة' 
      : 'Invalid email format'
  };

  return z.object({
    name: z.string().min(1, { message: messages.nameRequired }),
    phone: z.string()
      .min(1, { message: messages.phoneRequired })
      .regex(/^05\d{8}$/, { message: messages.phoneInvalid }),
    email: z.string()
      .min(1, { message: messages.emailRequired })
      .email({ message: messages.emailInvalid }),
    notes: z.string().optional()
  });
};

export const useCustomerFormValidation = (
  initialData: CustomerDetails,
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void,
  onValidationChange?: (isValid: boolean) => void
) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create schema with language-specific messages
  const customerSchema = createCustomerSchema(language);
  
  // Set up the form with React Hook Form
  const form = useForm<CustomerDetails>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: initialData
  });
  
  const {
    register,
    formState: { errors, isValid, isDirty, isValidating },
    watch,
    trigger,
    setValue,
    control,
    handleSubmit
  } = form;
  
  // Watch all form values for changes
  const formValues = watch();
  
  // Update context when form values change
  const handleFieldChange = (field: keyof CustomerDetails, value: string) => {
    setValue(field, value);
    onCustomerDetailsChange(field, value);
    
    // Trigger validation after value change
    trigger(field).then(fieldValid => {
      logger.debug(`Field ${field} validity changed: ${fieldValid}`);
    });
  };
  
  // Submit handler (used internally by the form)
  const onSubmit = (data: CustomerDetails) => {
    logger.debug('Form submitted successfully:', data);
    setIsSubmitting(true);
    
    // Add any submission logic here
    
    setIsSubmitting(false);
  };
  
  // Notify parent component about validation state changes
  useState(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  });
  
  return {
    register,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    isValidating,
    handleSubmit: handleSubmit(onSubmit),
    formValues,
    handleFieldChange,
    trigger,
    form // Expose the form object for use with FormField components
  };
};
