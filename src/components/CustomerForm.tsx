
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useEnhancedFormValidation } from "@/hooks/useEnhancedFormValidation";

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

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
  const isRTL = language === 'ar';
  
  const {
    fieldValidation,
    isValid,
    handleFieldChange,
    validateField
  } = useEnhancedFormValidation(customerDetails, onCustomerDetailsChange, onValidationChange);

  const handleBlur = (field: keyof CustomerDetails) => {
    validateField(field);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-4 max-w-md mx-auto w-full">
        <div className="form-field">
          <Label 
            htmlFor="name" 
            className={cn("block text-sm font-medium", isRTL ? "text-right" : "")}
          >
            {t('name')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={customerDetails.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={cn(
              "mt-1 w-full",
              !fieldValidation.name.isValid && fieldValidation.name.isDirty ? "border-destructive" : "",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
            required
            aria-invalid={!fieldValidation.name.isValid}
            aria-describedby="name-error"
          />
          {!fieldValidation.name.isValid && fieldValidation.name.isDirty && fieldValidation.name.errorMessage && (
            <p id="name-error" className={cn(
              "text-sm text-destructive mt-1",
              isRTL ? "text-right" : ""
            )}>
              {fieldValidation.name.errorMessage}
            </p>
          )}
        </div>
        
        <div className="form-field">
          <Label 
            htmlFor="phone"
            className={cn("block text-sm font-medium", isRTL ? "text-right" : "")}
          >
            {t('phone')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={customerDetails.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={() => handleBlur('phone')}
            className={cn(
              "mt-1 w-full",
              !fieldValidation.phone.isValid && fieldValidation.phone.isDirty ? "border-destructive" : "",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
            required
            maxLength={10}
            aria-invalid={!fieldValidation.phone.isValid}
            aria-describedby="phone-error"
          />
          {!fieldValidation.phone.isValid && fieldValidation.phone.isDirty && fieldValidation.phone.errorMessage && (
            <p id="phone-error" className={cn(
              "text-sm text-destructive mt-1",
              isRTL ? "text-right" : ""
            )}>
              {fieldValidation.phone.errorMessage}
            </p>
          )}
        </div>
        
        <div className="form-field">
          <Label 
            htmlFor="email"
            className={cn("block text-sm font-medium", isRTL ? "text-right" : "")}
          >
            {t('email')} {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={cn(
              "mt-1 w-full",
              !fieldValidation.email.isValid && fieldValidation.email.isDirty ? "border-destructive" : "",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
            required
            aria-invalid={!fieldValidation.email.isValid}
            aria-describedby="email-error"
          />
          {!fieldValidation.email.isValid && fieldValidation.email.isDirty && fieldValidation.email.errorMessage && (
            <p id="email-error" className={cn(
              "text-sm text-destructive mt-1",
              isRTL ? "text-right" : ""
            )}>
              {fieldValidation.email.errorMessage}
            </p>
          )}
        </div>
        
        <div className="form-field">
          <Label 
            htmlFor="notes"
            className={cn("block text-sm font-medium", isRTL ? "text-right" : "")}
          >
            {t('notes')} ({language === 'ar' ? 'اختياري' : 'optional'})
          </Label>
          <Input
            id="notes"
            value={customerDetails.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className={cn(
              "mt-1 w-full",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
          />
        </div>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        {isValid ? (
          <p className="text-green-600">
            {language === 'ar' ? 'جميع البيانات صحيحة' : 'All fields are valid'}
          </p>
        ) : (
          <p>
            {language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة (*) بشكل صحيح' : 'Please fill all required fields (*) correctly'}
          </p>
        )}
      </div>
    </div>
  );
};
