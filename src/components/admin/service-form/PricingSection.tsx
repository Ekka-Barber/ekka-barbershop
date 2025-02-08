
import { Service } from '@/types/service';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingSectionProps {
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
  language: string;
}

export const PricingSection = ({ service, onChange, language }: PricingSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {language === 'ar' ? 'السعر (ريال)' : 'Price (SAR)'}
        </label>
        <Input
          type="number"
          value={service.price || ''}
          onChange={(e) => onChange({ ...service, price: parseFloat(e.target.value) || 0 })}
          placeholder={language === 'ar' ? 'أدخل السعر' : 'Enter price'}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Discount Type</label>
        <Select
          value={service.discount_type || 'none'}
          onValueChange={(value: 'percentage' | 'amount' | 'none') => 
            onChange({ 
              ...service, 
              discount_type: value === 'none' ? null : value,
              discount_value: value === 'none' ? null : service.discount_value
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No discount</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {service.discount_type && (
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Discount Value {service.discount_type === 'percentage' ? '(%)' : '($)'}
          </label>
          <Input
            type="number"
            value={service.discount_value || ''}
            onChange={(e) => onChange({ 
              ...service, 
              discount_value: parseFloat(e.target.value) || 0 
            })}
            placeholder={`Enter discount ${service.discount_type === 'percentage' ? 'percentage' : 'amount'}`}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
