
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CustomerFormProps {
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
}

export const CustomerForm = ({
  customerDetails,
  onCustomerDetailsChange
}: CustomerFormProps) => {
  const { t, language } = useLanguage();
  const [phoneError, setPhoneError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const isRTL = language === 'ar';

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, '');
    
    // Validate phone number length - must be exactly 10 digits
    if (numbersOnly.length > 0 && numbersOnly.length !== 10) {
      setPhoneError(language === 'ar' ? 'رقم الهاتف يجب أن يكون 10 أرقام' : 'Phone number must be 10 digits');
    } else {
      setPhoneError("");
    }
    
    onCustomerDetailsChange('phone', numbersOnly);
  };

  const handleEmailChange = (value: string) => {
    if (value === '') {
      setEmailError('');
      onCustomerDetailsChange('email', value);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
    } else {
      setEmailError("");
    }
    onCustomerDetailsChange('email', value);
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
            onChange={(e) => onCustomerDetailsChange('name', e.target.value)}
            className={cn(
              "mt-1 w-full",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full name'}
            required
          />
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
            onChange={(e) => handlePhoneChange(e.target.value)}
            className={cn(
              "mt-1 w-full",
              phoneError ? "border-destructive" : "",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone number'}
            required
            maxLength={10}
          />
          {phoneError && (
            <p className={cn(
              "text-sm text-destructive mt-1",
              isRTL ? "text-right" : ""
            )}>
              {phoneError}
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
            onChange={(e) => handleEmailChange(e.target.value)}
            className={cn(
              "mt-1 w-full",
              emailError ? "border-destructive" : "",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
            required
          />
          {emailError && (
            <p className={cn(
              "text-sm text-destructive mt-1",
              isRTL ? "text-right" : ""
            )}>
              {emailError}
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
            onChange={(e) => onCustomerDetailsChange('notes', e.target.value)}
            className={cn(
              "mt-1 w-full",
              isRTL ? "text-right" : ""
            )}
            placeholder={language === 'ar' ? 'ملاحظات إضافية' : 'Additional notes'}
          />
        </div>
      </div>
    </div>
  );
};
