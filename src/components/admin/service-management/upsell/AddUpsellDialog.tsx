
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import { Service } from '@/types/service';
import { UpsellItem } from './types';

export interface AddUpsellDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export const AddUpsellDialog: React.FC<AddUpsellDialogProps> = ({
  isOpen,
  onOpenChange,
  services,
  onSubmit,
  isSubmitting
}) => {
  const [mainServiceId, setMainServiceId] = useState<string>('');
  const [upsellItems, setUpsellItems] = useState<UpsellItem[]>([
    { upsellServiceId: '', discountPercentage: 10 }
  ]);

  const handleAddUpsellItem = () => {
    setUpsellItems([...upsellItems, { upsellServiceId: '', discountPercentage: 10 }]);
  };

  const handleRemoveUpsellItem = (index: number) => {
    setUpsellItems(upsellItems.filter((_, i) => i !== index));
  };

  const handleUpsellItemChange = (index: number, field: keyof UpsellItem, value: string | number) => {
    const newItems = [...upsellItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setUpsellItems(newItems);
  };

  const getFilteredServices = (currentIndex: number) => {
    const selectedIds = new Set(upsellItems.map(item => item.upsellServiceId));
    selectedIds.delete(upsellItems[currentIndex].upsellServiceId); // Remove current item's ID
    
    return services.filter(service => 
      service.id !== mainServiceId && 
      !selectedIds.has(service.id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out incomplete items
    const validItems = upsellItems.filter(item => item.upsellServiceId);
    
    if (!mainServiceId || validItems.length === 0) {
      return; // Don't submit if no main service or no valid upsell items
    }
    
    onSubmit({
      mainServiceId,
      upsellItems: validItems
    });
    
    // Reset form
    setMainServiceId('');
    setUpsellItems([{ upsellServiceId: '', discountPercentage: 10 }]);
  };

  const mainServiceOptions = services.filter(service => 
    !upsellItems.some(item => item.upsellServiceId === service.id)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Upsell Relationship</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="mainService">Main Service</Label>
              <Select 
                value={mainServiceId} 
                onValueChange={setMainServiceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {mainServiceOptions.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Upsell Services</Label>
              
              {upsellItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select 
                    value={item.upsellServiceId} 
                    onValueChange={(value) => handleUpsellItemChange(index, 'upsellServiceId', value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredServices(index).map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={item.discountPercentage}
                      onChange={(e) => handleUpsellItemChange(
                        index, 
                        'discountPercentage', 
                        Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      )}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                    <span className="ml-2 mr-2">%</span>
                  </div>
                  
                  {upsellItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveUpsellItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddUpsellItem}
                disabled={upsellItems.some(item => !item.upsellServiceId)}
                className="mt-2"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Another Service
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                isSubmitting || 
                !mainServiceId || 
                upsellItems.some(item => !item.upsellServiceId)
              }
            >
              {isSubmitting ? 'Saving...' : 'Save Upsell'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
