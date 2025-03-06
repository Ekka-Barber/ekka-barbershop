
import { useMutation } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { UpsellItem } from './types';

type UpsellMutationsProps = {
  onSuccess: () => void;
};

export const useUpsellMutations = ({ onSuccess }: UpsellMutationsProps) => {
  const { toast } = useToast();

  // Mutation to add new upsell relationships
  const addUpsellMutation = useMutation({
    mutationFn: async (data: { mainServiceId: string; upsellItems: UpsellItem[] }) => {
      const { mainServiceId, upsellItems } = data;
      
      if (!mainServiceId || upsellItems.some(item => !item.upsellServiceId)) {
        throw new Error('Please select both main service and all upsell services');
      }
      
      // Check for duplicate upsell services in the form
      const uniqueUpsellIds = new Set(upsellItems.map(item => item.upsellServiceId));
      if (uniqueUpsellIds.size !== upsellItems.length) {
        throw new Error('Each upsell service must be unique');
      }

      // Create array to store promises for batch insert
      const insertPromises = [];

      for (const item of upsellItems) {
        // Check if relation already exists
        const { data: existing, error: checkError } = await supabase
          .from('service_upsells')
          .select('id')
          .eq('main_service_id', mainServiceId)
          .eq('upsell_service_id', item.upsellServiceId)
          .maybeSingle();

        if (checkError) throw checkError;
        
        if (existing) {
          throw new Error(`An upsell relationship already exists for this service: ${item.upsellServiceId}`);
        }

        // Add insert operation to array
        insertPromises.push(
          supabase
            .from('service_upsells')
            .insert({
              main_service_id: mainServiceId,
              upsell_service_id: item.upsellServiceId,
              discount_percentage: item.discountPercentage,
            })
        );
      }

      // Execute all inserts
      const results = await Promise.all(insertPromises);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Error adding relationship: ${errors[0].error?.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New upsell relationships added successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation to update upsell discount
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, discount }: { id: string; discount: number }) => {
      const { error } = await supabase
        .from('service_upsells')
        .update({ discount_percentage: discount })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Discount updated",
        description: "The upsell discount has been updated successfully."
      });
      onSuccess();
    }
  });

  // Mutation to delete upsell relationship
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Upsell removed",
        description: "The upsell relationship has been removed successfully."
      });
      onSuccess();
    }
  });

  return {
    addUpsellMutation,
    updateUpsellMutation,
    deleteUpsellMutation
  };
};
