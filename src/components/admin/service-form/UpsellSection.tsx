
import { Service } from '@/types/service';
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpsellSectionProps {
  service: Partial<Service>;
  availableServices: Service[];
  selectedUpsells: Array<{ serviceId: string; discountPercentage: number }>;
  onUpsellsChange: (upsells: Array<{ serviceId: string; discountPercentage: number }>) => void;
  language: string;
}

export const UpsellSection = ({ 
  service, 
  availableServices, 
  selectedUpsells, 
  onUpsellsChange,
  language 
}: UpsellSectionProps) => {
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
  );
};
