
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Service } from '@/types/service';
import { AddUpsellFormState, UpsellItem } from '../types';
import { UseMutationResult } from '@tanstack/react-query';

interface UseUpsellFormStateProps {
  addUpsellMutation: UseMutationResult<void, Error, AddUpsellFormState, unknown>;
}

export const useUpsellFormState = ({ addUpsellMutation }: UseUpsellFormStateProps) => {
  const { toast } = useToast();
  const [newUpsell, setNewUpsell] = useState<AddUpsellFormState>({
    mainServiceId: '',
    upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
  });

  // Reset form when dialog closes
  const resetForm = () => {
    setNewUpsell({
      mainServiceId: '',
      upsellItems: [{ upsellServiceId: '', discountPercentage: 10 }],
    });
  };

  // Update main service ID
  const updateMainServiceId = (value: string) => {
    setNewUpsell({ ...newUpsell, mainServiceId: value });
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

  // Get available services for a specific upsell item (excluding already selected ones)
  const getAvailableServices = (allServices: Service[] | undefined, index: number) => {
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

  return {
    newUpsell,
    resetForm,
    updateMainServiceId,
    addUpsellItem,
    removeUpsellItem,
    updateUpsellItem,
    getAvailableServices,
    handleAddUpsell
  };
};
