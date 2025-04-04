
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerDetails } from "@/types/booking";
import { useCustomerFormValidation } from "@/hooks/useCustomerFormValidation";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { useEffect } from "react";

interface CustomerFormProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const CustomerForm = ({
  customerDetails,
  onCustomerDetailsChange,
  onValidationChange
}: CustomerFormProps) => {
  const { t, language } = useLanguage();
  
  const {
    register,
    errors,
    isValid,
    handleSubmit,
    handleFieldChange,
    formValues,
    trigger
  } = useCustomerFormValidation(customerDetails, onCustomerDetailsChange, onValidationChange);
  
  // Run validation once when component mounts to update parent validation state
  useEffect(() => {
    trigger();
  }, [trigger]);
  
  // Also notify parent whenever validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <Form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
      <form className="space-y-6">
        <div className="space-y-4">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('name')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...register('name')}
                    value={formValues.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder={language === 'ar' ? 'ادخل الاسم' : 'Enter name'}
                    className={errors.name ? "border-destructive" : ""}
                  />
                </FormControl>
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('phone')} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...register('phone')}
                    value={formValues.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    type="tel"
                    maxLength={10}
                    placeholder="05XXXXXXXX"
                    className={errors.phone ? "border-destructive" : ""}
                  />
                </FormControl>
                {errors.phone && (
                  <FormMessage>{errors.phone.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('email')} <span className="text-destructive">*</span> 
                  <span className="text-sm text-muted-foreground ml-1">
                    {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...register('email')}
                    value={formValues.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    type="email"
                    placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                    className={errors.email ? "border-destructive" : ""}
                  />
                </FormControl>
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
          />
          
          <FormField
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('notes')} ({language === 'ar' ? 'اختياري' : 'optional'})
                </FormLabel>
                <FormControl>
                  <Input
                    {...register('notes')}
                    value={formValues.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder={language === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
