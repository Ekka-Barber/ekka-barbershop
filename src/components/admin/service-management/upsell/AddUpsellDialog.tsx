
import { useState, ReactNode } from 'react';
import { Plus, X, Info, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from "@/contexts/LanguageContext";
import { Service } from '@/types/service';
import { UseMutationResult } from '@tanstack/react-query';
import { AddUpsellFormState, UpsellItem } from './types';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Create New Upsell Relationship
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Upsell relationships allow you to offer discounted services when purchased with a main service.
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Step 1: Main Service Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center">
                <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs mr-2">1</span>
                Select Main Service
              </label>
              <div className="text-xs text-muted-foreground">Required</div>
            </div>
            <Select
              value={newUpsell.mainServiceId}
              onValueChange={(value) => setNewUpsell({...newUpsell, mainServiceId: value})}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select main service" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <ScrollArea className="h-80">
                  {allServices?.map(service => (
                    <SelectItem key={`main-${service.id}`} value={service.id}>
                      {language === 'ar' ? service.name_ar : service.name_en}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
            <div className="flex items-start text-xs text-muted-foreground bg-muted/30 p-2 rounded border border-muted/50">
              <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <p>This is the primary service that customers will purchase first.</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Step 2: Upsell Services */}
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
                onClick={addUpsellItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Another
              </Button>
            </div>
            
            <div className="space-y-3">
              {newUpsell.upsellItems.map((item, index) => (
                <div key={index} className="relative bg-muted/10 p-3 rounded border border-muted/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Upsell Service {index + 1}</label>
                      {newUpsell.upsellItems.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeUpsellItem(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                    
                    <Select
                      value={item.upsellServiceId}
                      onValueChange={(value) => updateUpsellItem(index, 'upsellServiceId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select upsell service" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        <ScrollArea className="h-80">
                          {getAvailableServices(index).map(service => (
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
                          onChange={(e) => updateUpsellItem(
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
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddUpsell} 
            disabled={addUpsellMutation.isPending}
            className="flex items-center"
          >
            {addUpsellMutation.isPending ? (
              'Adding...'
            ) : (
              <>
                Create Relationship
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
