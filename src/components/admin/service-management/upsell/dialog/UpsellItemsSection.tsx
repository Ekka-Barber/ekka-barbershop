
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Service } from '@/types/service';
import { UpsellItem } from '../types';
import { UpsellItemForm } from './UpsellItemForm';

interface UpsellItemsSectionProps {
  upsellItems: UpsellItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof UpsellItem, value: string | number) => void;
  onRemoveItem: (index: number) => void;
  getAvailableServices: (index: number) => Service[];
}

export const UpsellItemsSection = ({
  upsellItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  getAvailableServices
}: UpsellItemsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center">
          <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs mr-2">2</span>
          Add Upsell Services
        </label>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          className="h-8 px-2 text-xs"
          onClick={onAddItem}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Another
        </Button>
      </div>
      
      <div className="space-y-3">
        {upsellItems.map((item, index) => (
          <UpsellItemForm
            key={index}
            item={item}
            index={index}
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
            availableServices={getAvailableServices(index)}
            showRemoveButton={upsellItems.length > 1}
          />
        ))}
      </div>
    </div>
  );
};
