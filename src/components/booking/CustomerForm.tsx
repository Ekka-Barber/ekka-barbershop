
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerDetails } from "@/types/booking";
import { useCustomerFormValidation } from "@/hooks/useCustomerFormValidation";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerFormProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  isLoading?: boolean;
}

export const CustomerForm = ({
  customerDetails,
  onCustomerDetailsChange,
  onValidationChange,
  isLoading = false
}: CustomerFormProps) => {
  const { t, language } = useLanguage();
  
  const {
    register,
    errors,
    isValid,
    handleSubmit,
    handleFieldChange,
    formValues,
    trigger,
    form
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

  if (isLoading) {
    return <CustomerFormSkeleton />;
  }

  return (
    <div className="space-y-6 px-1 md:px-4">
      <div className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('name')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('phone')} <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('email')} <span className="text-destructive">*</span> 
                <span className="text-xs text-muted-foreground ml-1">
                  {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'}
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
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
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('notes')} ({language === 'ar' ? 'اختياري' : 'optional'})
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formValues.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  placeholder={language === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

// Create a skeleton loader for the CustomerForm
export const CustomerFormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse px-1 md:px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};
