
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    name: true, // Start with all fields as touched to validate immediately
    phone: true,
    email: true
  });

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CustomerDetails, string>> = {};
    
    // Validate name
    if (!customerDetails.name?.trim()) {
      newErrors.name = language === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    }
    
    // Validate phone number (Saudi format: starts with 05, 10 digits)
    if (!customerDetails.phone?.trim()) {
      newErrors.phone = language === 'ar' ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (!/^05\d{8}$/.test(customerDetails.phone)) {
      newErrors.phone = language === 'ar' 
        ? 'يجب أن يبدأ رقم الهاتف بـ 05 ويتكون من 10 أرقام' 
        : 'Phone number must start with 05 and be 10 digits';
    }
    
    // Validate email
    if (!customerDetails.email?.trim()) {
      newErrors.email = language === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    // Log validation results for debugging
    console.log('CustomerForm validation:', { errors: newErrors, isValid });
    
    // Update parent component with validation state
    if (onValidationChange) {
      console.log('Calling onValidationChange with:', isValid);
      onValidationChange(isValid);
    }
    
    // If form is valid, identify customer for TikTok tracking
    if (isValid) {
      identifyCustomer({
        email: customerDetails.email,
        phone: customerDetails.phone,
        id: `${customerDetails.email}_${customerDetails.phone}`
      });
    }
    
    return isValid;
  };

  // Immediate validation on component mount and whenever customerDetails change
  useEffect(() => {
    validateForm();
  }, [customerDetails]);
  
  // Force validation on mount
  useEffect(() => {
    validateForm();
  }, []);

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, '');
    onCustomerDetailsChange('phone', numbersOnly);
    
    setTouched(prev => ({
      ...prev,
      phone: true
    }));
  };

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    onCustomerDetailsChange(field, value);
    
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const getFieldStatus = (field: keyof CustomerDetails) => {
    if (!touched[field]) return null;
    return errors[field] ? 'error' : 'success';
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="name" className="text-sm font-medium flex items-center">
              {t('name')}
              <span className="text-destructive mx-1">*</span>
            </Label>
            {getFieldStatus('name') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <div className="relative">
            <Input 
              id="name" 
              value={customerDetails.name || ''} 
              onChange={e => handleInputChange('name', e.target.value)} 
              required 
              className={`h-10 ${errors.name && touched.name ? "border-destructive" : "border-gray-200"} 
                ${language === 'ar' ? 'text-right' : 'text-left'}`} 
              onBlur={() => setTouched(prev => ({...prev, name: true}))} 
              dir={language === 'ar' ? 'rtl' : 'ltr'} 
              placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'} 
            />
            {errors.name && touched.name && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
          {errors.name && touched.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center">
              {t('phone')}
              <span className="text-destructive mx-1">*</span>
            </Label>
            {getFieldStatus('phone') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <div className="relative">
            <Input 
              id="phone" 
              type="tel" 
              value={customerDetails.phone || ''} 
              onChange={e => handlePhoneChange(e.target.value)} 
              required 
              maxLength={10} 
              className={`h-10 ${errors.phone && touched.phone ? "border-destructive" : "border-gray-200"}
                ${language === 'ar' ? 'text-right' : 'text-left'}`} 
              onBlur={() => setTouched(prev => ({...prev, phone: true}))} 
              dir={language === 'ar' ? 'rtl' : 'ltr'} 
              placeholder={language === 'ar' ? 'رقم الجوال (يبدأ بـ 05)' : 'Phone Number (starts with 05)'} 
            />
            {errors.phone && touched.phone && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
          {errors.phone && touched.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center">
              <Label htmlFor="email" className="text-sm font-medium flex items-center">
                {t('email')}
                <span className="text-destructive mx-1">*</span>
              </Label>
              <span className="text-xs text-muted-foreground mr-1 ml-1">
                {language === 'ar' ? '( لغرض تنبيهات الحجز )' : '(for appointment notifications)'}
              </span>
            </div>
            {getFieldStatus('email') === 'success' && <Check className="h-4 w-4 text-green-500" />}
          </div>
          <div className="relative">
            <Input 
              id="email" 
              type="email" 
              value={customerDetails.email || ''} 
              onChange={e => handleInputChange('email', e.target.value)} 
              required 
              className={`h-10 ${errors.email && touched.email ? "border-destructive" : "border-gray-200"}
                ${language === 'ar' ? 'text-right' : 'text-left'}`} 
              onBlur={() => setTouched(prev => ({...prev, email: true}))} 
              dir={language === 'ar' ? 'rtl' : 'ltr'} 
              placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} 
            />
            {errors.email && touched.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
          </div>
          {errors.email && touched.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center">
              {t('notes')}
              <span className="text-xs text-muted-foreground mr-1 ml-1">
                ({language === 'ar' ? 'اختياري' : 'optional'})
              </span>
            </Label>
          </div>
          <Textarea 
            id="notes" 
            value={customerDetails.notes || ''} 
            onChange={e => handleInputChange('notes', e.target.value)} 
            className={`min-h-[80px] ${language === 'ar' ? 'text-right' : 'text-left'}`} 
            dir={language === 'ar' ? 'rtl' : 'ltr'} 
            placeholder={language === 'ar' ? 'أي ملاحظات إضافية؟' : 'Any additional notes?'} 
          />
        </div>
      </div>

      {/* Form Status Summary - only show if there are errors */}
      {Object.keys(errors).length > 0 && Object.values(touched).some(t => t) ? (
        <div className="mt-4 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                {language === 'ar' ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}
              </p>
              <ul className="list-disc list-inside mt-1 text-xs space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
