import { Service } from '@/types/service';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from '@/types/service';
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type ServiceFormProps = {
  categories: Category[] | undefined;
  service: Partial<Service>;
  onChange: (service: Partial<Service>) => void;
  availableServices?: Service[];
  selectedUpsells: Array<{ serviceId: string; discountPercentage: number }>;
  onUpsellsChange: (upsells: Array<{ serviceId: string; discountPercentage: number }>) => void;
};

export const ServiceForm = ({ 
  categories, 
  service, 
  onChange,
  availableServices = [],
  selectedUpsells = [],
  onUpsellsChange
}: ServiceFormProps) => {
  const { language } = useLanguage();

  const handleUpsellServiceSelect = (serviceId: string) => {
    if (!selectedUpsells.some(u => u.serviceId === serviceId)) {
      onUpsellsChange([...selectedUpsells, { serviceId, discountPercentage: 0 }]);
    }
  };

  const handleUpsellDiscountChange = (serviceId: string, discountPercentage: number) => {
    onUpsellsChange(
      selectedUpsells.map(upsell => 
        upsell.serviceId === serviceId 
          ? { ...upsell, discountPercentage } 
          : upsell
      )
    );
  };

  const removeUpsell = (serviceId: string) => {
    onUpsellsChange(selectedUpsells.filter(upsell => upsell.serviceId !== serviceId));
  };
  
  return (
    <Card className="border-none shadow-none">
      <CardContent className="space-y-6 p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
            <Select
              value={service.category_id}
              onValueChange={(value) => onChange({ ...service, category_id: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Duration (minutes)</label>
            <Input
              type="number"
              value={service.duration || ''}
              onChange={(e) => onChange({ ...service, duration: parseInt(e.target.value) || 0 })}
              placeholder="Enter duration"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">English Name</label>
            <Input
              value={service.name_en}
              onChange={(e) => onChange({ ...service, name_en: e.target.value })}
              placeholder="Enter service name in English"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Arabic Name</label>
            <Input
              value={service.name_ar}
              onChange={(e) => onChange({ ...service, name_ar: e.target.value })}
              placeholder="Enter service name in Arabic"
              className="w-full"
              dir="rtl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">English Description</label>
          <Textarea
            value={service.description_en || ''}
            onChange={(e) => onChange({ ...service, description_en: e.target.value })}
            placeholder="Enter service description in English"
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Arabic Description</label>
          <Textarea
            value={service.description_ar || ''}
            onChange={(e) => onChange({ ...service, description_ar: e.target.value })}
            placeholder="Enter service description in Arabic"
            className="min-h-[100px] resize-none"
            dir="rtl"
          />
        </div>

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

        {/* Upsell Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Upsell Options</h3>
            <Select onValueChange={handleUpsellServiceSelect}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Add upsell service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices
                  .filter(s => s.id !== service.id && !selectedUpsells.some(u => u.serviceId === s.id))
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {language === 'ar' ? s.name_ar : s.name_en}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {selectedUpsells.map((upsell) => {
              const upsellService = availableServices.find(s => s.id === upsell.serviceId);
              if (!upsellService) return null;

              return (
                <div key={upsell.serviceId} className="flex items-center space-x-4 bg-secondary/20 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{language === 'ar' ? upsellService.name_ar : upsellService.name_en}</p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={upsell.discountPercentage}
                      onChange={(e) => handleUpsellDiscountChange(upsell.serviceId, parseFloat(e.target.value) || 0)}
                      placeholder="Discount %"
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => removeUpsell(upsell.serviceId)}
                    className="p-1 hover:bg-secondary rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};