
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { CustomerDetails } from "@/types/booking";
import { identifyCustomer } from "@/utils/tiktokTracking";
import { Check, AlertCircle } from "lucide-react";

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
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({
    name: false,
    phone: false,
    email: false
  });

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
    // Only validate if any field has been touched
    if (Object.values(touched).some(t => t)) {
      const isValid = validateForm();
      onValidationChange?.(isValid);
    }
  }, [customerDetails, touched]);

  const handlePhoneChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '');
    onCustomerDetailsChange('phone', numbersOnly);
    setTouched(prev => ({ ...prev, phone: true }));
  };

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    onCustomerDetailsChange(field, value);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldStatus = (field: keyof CustomerDetails) => {
    if (!touched[field]) return null;
    return errors[field] ? 'error' : 'success';
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center justify-between">
            {t('name')} <span className="text-destructive">*</span>
            {getFieldStatus('name') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              id="name"
              value={customerDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className={errors.name && touched.name ? "border-destructive pr-10" : ""}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            />
            {errors.name && touched.name && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
          </div>
          {errors.name && touched.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone" className="flex items-center justify-between">
            {t('phone')} <span className="text-destructive">*</span>
            {getFieldStatus('phone') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              value={customerDetails.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
              maxLength={10}
              className={errors.phone && touched.phone ? "border-destructive pr-10" : ""}
              onBlur={() => setTouched(prev => ({ ...prev, phone: true }))}
            />
            {errors.phone && touched.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
          </div>
          {errors.phone && touched.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="flex items-center justify-between">
            {t('email')} {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'} <span className="text-destructive">*</span>
            {getFieldStatus('email') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={customerDetails.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className={errors.email && touched.email ? "border-destructive pr-10" : ""}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            />
            {errors.email && touched.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
            )}
          </div>
          {errors.email && touched.email && (
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
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>
      </div>

      {/* Form Status Summary */}
      <div className={`mt-4 p-3 rounded-md ${
        Object.keys(errors).length > 0 && Object.values(touched).some(t => t)
          ? 'bg-red-50 border border-red-200 text-red-700'
          : Object.values(touched).every(t => t) && Object.keys(errors).length === 0
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'hidden'
      }`}>
        {Object.keys(errors).length > 0 && Object.values(touched).some(t => t) ? (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium">
                {language === 'ar' ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}
              </p>
              <ul className="list-disc list-inside mt-1 text-sm">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : Object.values(touched).every(t => t) && Object.keys(errors).length === 0 ? (
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <p>
              {language === 'ar' ? 'تم تعبئة جميع الحقول بشكل صحيح!' : 'All fields are filled correctly!'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
