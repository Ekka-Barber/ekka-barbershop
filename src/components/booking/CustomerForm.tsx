
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { CustomerDetails } from "@/types/booking";
import { identifyCustomer } from "@/utils/tiktokTracking";

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
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};
    
    if (!customerDetails.name.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }
    
    if (!customerDetails.phone.trim()) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!/^\d{10}$/.test(customerDetails.phone)) {
      newErrors.phone = language === 'ar' 
        ? 'رقم الهاتف يجب أن يكون 10 أرقام' 
        : 'Phone number must be 10 digits';
    }
    
    if (!customerDetails.email.trim()) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = language === 'ar' 
        ? 'يرجى إدخال بريد إلكتروني صحيح' 
        : 'Please enter a valid email address';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    // If form is valid, identify customer for TikTok tracking
    if (isValid) {
      identifyCustomer({
        email: customerDetails.email,
        phone: customerDetails.phone,
        id: `${customerDetails.email}_${customerDetails.phone}` // Create a unique ID from email and phone
      });
    }
    
    return isValid;
  };

  useEffect(() => {
    const isValid = validateForm();
    onValidationChange?.(isValid);
  }, [customerDetails]);

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    onCustomerDetailsChange('phone', numbersOnly);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            {t('name')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={customerDetails.name}
            onChange={(e) => onCustomerDetailsChange('name', e.target.value)}
            required
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">
            {t('phone')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={customerDetails.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            required
            maxLength={10}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">
            {t('email')} {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => onCustomerDetailsChange('email', e.target.value)}
            required
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="notes">
            {t('notes')} ({language === 'ar' ? 'اختياري' : 'optional'})
          </Label>
          <Input
            id="notes"
            value={customerDetails.notes}
            onChange={(e) => onCustomerDetailsChange('notes', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

