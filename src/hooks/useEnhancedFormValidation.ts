
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CustomerDetails } from '@/types/booking';
import { logger } from '@/utils/logger';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

// Define the field validation states
type FieldValidationState = {
  isDirty: boolean;
  isValid: boolean;
  errorMessage?: string;
};

// Define a schema creator based on language
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
      : 'Invalid email format',
    // Add more validation messages as needed
  };

  // Create schema with specific error messages
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

export const useEnhancedFormValidation = (
  initialData: CustomerDetails,
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void,
  onValidationChange?: (isValid: boolean) => void
) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldValidation, setFieldValidation] = useState<Record<keyof CustomerDetails, FieldValidationState>>({
    name: { isDirty: false, isValid: false },
    phone: { isDirty: false, isValid: false },
    email: { isDirty: false, isValid: false },
    notes: { isDirty: false, isValid: true } // Notes are optional
  });
  
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
    formState: { errors, isValid, isDirty, isValidating, touchedFields },
    watch,
    trigger,
    setValue,
    control,
    handleSubmit
  } = form;
  
  // Watch all form values for changes
  const formValues = watch();
  
  // Update field validation states when errors or touched fields change
  useEffect(() => {
    const newFieldValidation = { ...fieldValidation };
    
    // Update each field's validation state
    (Object.keys(formValues) as Array<keyof CustomerDetails>).forEach(field => {
      newFieldValidation[field] = {
        isDirty: !!touchedFields[field],
        isValid: !errors[field],
        errorMessage: errors[field]?.message as string | undefined
      };
    });
    
    setFieldValidation(newFieldValidation);
    
    // Log validation state changes at debug level
    logger.debug('Field validation states updated:', newFieldValidation);
  }, [errors, touchedFields, formValues]);
  
  // Update context when form values change
  const handleFieldChange = (field: keyof CustomerDetails, value: string) => {
    setValue(field, value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    onCustomerDetailsChange(field, value);
    
    // Trigger validation after value change
    trigger(field).then(fieldValid => {
      // Update the specific field validation state
      setFieldValidation(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          isDirty: true,
          isValid: fieldValid,
          errorMessage: errors[field]?.message as string | undefined
        }
      }));
      
      logger.debug(`Field ${field} validity changed: ${fieldValid}`);
    });
  };
  
  // Function to validate a specific field and show toast notification
  const validateField = (field: keyof CustomerDetails) => {
    trigger(field).then(isValid => {
      if (!isValid && errors[field]) {
        toast({
          title: t('validation.error'),
          description: errors[field]?.message as string,
          variant: "destructive"
        });
      }
      return isValid;
    });
  };
  
  // Submit handler
  const onSubmit = (data: CustomerDetails) => {
    logger.info('Form submitted successfully:', data);
    setIsSubmitting(true);
    
    // Add any submission logic here
    
    setIsSubmitting(false);
  };
  
  // Notify parent component about validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);
  
  return {
    register,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    isValidating,
    fieldValidation,
    handleSubmit: handleSubmit(onSubmit),
    formValues,
    handleFieldChange,
    validateField,
    trigger,
    form, // Expose the form object for use with FormField components
    resetField: (field: keyof CustomerDetails) => {
      setValue(field, initialData[field] || '');
      setFieldValidation(prev => ({
        ...prev,
        [field]: { isDirty: false, isValid: !initialData[field] ? true : false }
      }));
    }
  };
};
