
import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Service } from '@/types/service';
import { UseMutationResult } from '@tanstack/react-query';
import { AddUpsellFormState } from './types';
import { MainServiceSelector } from './dialog/MainServiceSelector';
import { UpsellItemsSection } from './dialog/UpsellItemsSection';
import { useUpsellFormState } from './dialog/useUpsellFormState';

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
  const {
    newUpsell,
    resetForm,
    updateMainServiceId,
    addUpsellItem,
    removeUpsellItem,
    updateUpsellItem,
    getAvailableServices,
    handleAddUpsell
  } = useUpsellFormState({ addUpsellMutation });

  // Handle dialog open state change
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
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
          <MainServiceSelector 
            mainServiceId={newUpsell.mainServiceId}
            onChange={updateMainServiceId}
            allServices={allServices}
          />
          
          <Separator />
          
          {/* Step 2: Upsell Services */}
          <UpsellItemsSection 
            upsellItems={newUpsell.upsellItems}
            onAddItem={addUpsellItem}
            onUpdateItem={updateUpsellItem}
            onRemoveItem={removeUpsellItem}
            getAvailableServices={(index) => getAvailableServices(allServices, index)}
          />
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
