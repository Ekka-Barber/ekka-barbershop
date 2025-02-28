
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
  isMobile?: boolean;
}

export const PricingSection = ({ service, onChange, language, isMobile = false }: PricingSectionProps) => {
  const handleDiscountTypeChange = (value: string) => {
    onChange({ 
      ...service, 
      discount_type: value === "none" ? null : value as 'percentage' | 'fixed',
      discount_value: null
    });
  };

  return (
    <div className={`space-y-${isMobile ? '3' : '4'}`}>
      <div className={`space-y-${isMobile ? '1' : '2'}`}>
        <h3 className={`font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>Pricing</h3>
      </div>

      <div className={`grid grid-cols-1 ${isMobile ? 'gap-3' : 'md:grid-cols-2 gap-6'}`}>
        <div className={`space-y-${isMobile ? '1' : '2'}`}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Price (SAR)</label>
          <Input
            type="number"
            value={service.price || ''}
            onChange={(e) => onChange({ ...service, price: parseFloat(e.target.value) || 0 })}
            placeholder="Enter price"
            className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
          />
        </div>

        <div className={`space-y-${isMobile ? '1' : '2'}`}>
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Discount Type</label>
          <Select
            value={service.discount_type || 'none'}
            onValueChange={handleDiscountTypeChange}
          >
            <SelectTrigger className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}>
              <SelectValue placeholder="No discount" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No discount</SelectItem>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {service.discount_type && (
        <div className="grid grid-cols-1">
          <div className={`space-y-${isMobile ? '1' : '2'}`}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {service.discount_type === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (SAR)'}
            </label>
            <Input
              type="number"
              value={service.discount_value || ''}
              onChange={(e) => onChange({ 
                ...service, 
                discount_value: parseFloat(e.target.value) || 0 
              })}
              placeholder={`Enter discount ${service.discount_type === 'percentage' ? 'percentage' : 'amount'}`}
              className={`w-full ${isMobile ? 'h-8 text-sm' : ''}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
