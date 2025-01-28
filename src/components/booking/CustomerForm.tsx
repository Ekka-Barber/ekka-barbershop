import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">{t('name')} *</Label>
          <Input
            id="name"
            value={customerDetails.name}
            onChange={(e) => onCustomerDetailsChange('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">{t('phone')} *</Label>
          <Input
            id="phone"
            type="tel"
            value={customerDetails.phone}
            onChange={(e) => onCustomerDetailsChange('phone', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) => onCustomerDetailsChange('email', e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="notes">{t('notes')}</Label>
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