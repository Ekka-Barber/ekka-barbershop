
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, '');
    
    // Validate phone number length
    if (numbersOnly.length < 8) {
      setPhoneError(language === 'ar' ? 'رقم الهاتف يجب أن يكون 8 أرقام على الأقل' : 'Phone number must be at least 8 digits');
    } else if (numbersOnly.length > 15) {
      setPhoneError(language === 'ar' ? 'رقم الهاتف يجب أن لا يتجاوز 15 رقم' : 'Phone number must not exceed 15 digits');
    } else {
      setPhoneError("");
    }
    
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
          />
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
            className={phoneError ? "border-destructive" : ""}
          />
          {phoneError && (
            <p className="text-sm text-destructive mt-1">{phoneError}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">
            {t('email')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => onCustomerDetailsChange('email', e.target.value)}
            required
          />
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
