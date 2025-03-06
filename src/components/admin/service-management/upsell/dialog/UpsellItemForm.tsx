
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from '@/types/service';
import { UpsellItem } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UpsellItemFormProps {
  item: UpsellItem;
  index: number;
  onUpdate: (index: number, field: keyof UpsellItem, value: string | number) => void;
  onRemove: (index: number) => void;
  availableServices: Service[];
  showRemoveButton: boolean;
}

export const UpsellItemForm = ({
  item,
  index,
  onUpdate,
  onRemove,
  availableServices,
  showRemoveButton
}: UpsellItemFormProps) => {
  const { language } = useLanguage();

  return (
    <div className="relative bg-muted/10 p-3 rounded border border-muted/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Upsell Service {index + 1}</label>
          {showRemoveButton && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          )}
        </div>
        
        <Select
          value={item.upsellServiceId}
          onValueChange={(value) => onUpdate(index, 'upsellServiceId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select upsell service" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <ScrollArea className="h-80">
              {availableServices.map(service => (
                <SelectItem key={`upsell-${service.id}-${index}`} value={service.id}>
                  {language === 'ar' ? service.name_ar : service.name_en}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Discount Percentage
          </label>
          <div className="flex items-center">
            <Input
              type="number"
              min={0}
              max={100}
              value={item.discountPercentage}
              onChange={(e) => onUpdate(
                index, 
                'discountPercentage', 
                parseInt(e.target.value) || 0
              )}
              className="h-9"
            />
            <span className="ml-2 text-sm">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
