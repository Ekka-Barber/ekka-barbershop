
import { useState, ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from '@/types/service';
import { UseMutationResult } from '@tanstack/react-query';
import { AddUpsellFormState, UpsellItem } from './types';

interface AddUpsellDialogProps {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allServices: Service[] | undefined;
  addUpsellMutation: UseMutationResult<void, Error, AddUpsellFormState, unknown>;
}

export const AddUpsellDialog = ({ 
  children, 
  isOpen, 
  onOpenChange, 
  allServices,
  addUpsellMutation
}: AddUpsellDialogProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [newUpsell, setNewUpsell] = useState<AddUpsellFormState>({
    mainServiceId: '',
    upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
  });

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewUpsell({
        mainServiceId: '',
        upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
      });
    }
    onOpenChange(open);
  };

  // Add a new upsell item to the form
  const addUpsellItem = () => {
    setNewUpsell({
      ...newUpsell,
      upsellItems: [...newUpsell.upsellItems, { upsellServiceId: '', discountPercentage: 10 }]
    });
  };

  // Remove an upsell item from the form
  const removeUpsellItem = (index: number) => {
    const updatedItems = [...newUpsell.upsellItems];
    updatedItems.splice(index, 1);
    setNewUpsell({
      ...newUpsell,
      upsellItems: updatedItems
    });
  };

  // Update an upsell item in the form
  const updateUpsellItem = (index: number, field: keyof UpsellItem, value: string | number) => {
    const updatedItems = [...newUpsell.upsellItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setNewUpsell({
      ...newUpsell,
      upsellItems: updatedItems
    });
  };

  // Handle form submission
  const handleAddUpsell = () => {
    if (!newUpsell.mainServiceId) {
      toast({
        title: "Missing information",
        description: "Please select a main service",
        variant: "destructive"
      });
      return;
    }

    if (newUpsell.upsellItems.some(item => !item.upsellServiceId)) {
      toast({
        title: "Missing information",
        description: "Please select all upsell services",
        variant: "destructive"
      });
      return;
    }

    // Check for services referring to themselves
    if (newUpsell.upsellItems.some(item => item.upsellServiceId === newUpsell.mainServiceId)) {
      toast({
        title: "Invalid selection",
        description: "Main service and upsell service cannot be the same",
        variant: "destructive"
      });
      return;
    }

    // Check for invalid discount values
    if (newUpsell.upsellItems.some(item => 
      item.discountPercentage < 0 || item.discountPercentage > 100
    )) {
      toast({
        title: "Invalid discount",
        description: "Discount must be between 0 and 100%",
        variant: "destructive"
      });
      return;
    }

    addUpsellMutation.mutate(newUpsell);
  };

  // Get available services for a specific upsell item (excluding already selected ones)
  const getAvailableServices = (index: number) => {
    if (!allServices) return [];

    const selectedIds = new Set(
      newUpsell.upsellItems
        .filter((_, i) => i !== index)
        .map(item => item.upsellServiceId)
    );

    // Also exclude the main service
    if (newUpsell.mainServiceId) {
      selectedIds.add(newUpsell.mainServiceId);
    }

    return allServices.filter(service => !selectedIds.has(service.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Upsell Relationship</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Main Service</label>
            <Select
              value={newUpsell.mainServiceId}
              onValueChange={(value) => setNewUpsell({...newUpsell, mainServiceId: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select main service" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {allServices?.map(service => (
                  <SelectItem key={`main-${service.id}`} value={service.id}>
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Upsell Services</label>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2"
                onClick={addUpsellItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another
              </Button>
            </div>
            
            {newUpsell.upsellItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Select
                    value={item.upsellServiceId}
                    onValueChange={(value) => updateUpsellItem(index, 'upsellServiceId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select upsell service" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {getAvailableServices(index).map(service => (
                        <SelectItem key={`upsell-${service.id}-${index}`} value={service.id}>
                          {language === 'ar' ? service.name_ar : service.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-16">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discountPercentage}
                      onChange={(e) => updateUpsellItem(
                        index, 
                        'discountPercentage', 
                        parseInt(e.target.value) || 0
                      )}
                      className="h-10"
                    />
                    <span className="ml-1">%</span>
                  </div>
                </div>
                
                {newUpsell.upsellItems.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeUpsellItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddUpsell} disabled={addUpsellMutation.isPending}>
            {addUpsellMutation.isPending ? 'Adding...' : 'Add Relationship'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
