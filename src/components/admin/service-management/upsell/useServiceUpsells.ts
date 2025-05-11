import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Service } from '@/types/service';

export interface UpsellRelationship {
  id: string;
  main_service_id: string;
  upsell_service_id: string;
  discount_percentage: number;
  main_service?: Service;
  upsell_service?: Service;
}

export const useServiceUpsells = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all services for selection
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select(`
          id,
          name_en,
          name_ar,
          category_id,
          category:categories(id, name_en)
        `)
        .order('name_en');

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch existing upsell relationships
  const { data: upsellRelationships, isLoading: isLoadingUpsells } = useQuery({
    queryKey: ['service-upsells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_upsells')
        .select(`
          id,
          main_service_id,
          upsell_service_id,
          discount_percentage,
          main_service:services!service_upsells_main_service_id_fkey(id, name_en),
          upsell_service:services!service_upsells_upsell_service_id_fkey(id, name_en)
        `);

      if (error) throw error;
      return data as UpsellRelationship[] || [];
    }
  });

  // Add a new upsell relationship
  const addUpsellMutation = useMutation({
    mutationFn: async (upsell: Omit<UpsellRelationship, 'id' | 'main_service' | 'upsell_service'>) => {
      const { data, error } = await supabase
        .from('service_upsells')
        .insert(upsell)
        .select();

      if (error) throw error;
      return data[0] as UpsellRelationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      toast({
        title: 'Success',
        description: 'Upsell relationship added successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update an existing upsell relationship
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, ...upsell }: Partial<UpsellRelationship> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_upsells')
        .update({
          main_service_id: upsell.main_service_id,
          upsell_service_id: upsell.upsell_service_id,
          discount_percentage: upsell.discount_percentage
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data[0] as UpsellRelationship;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      toast({
        title: 'Success',
        description: 'Upsell relationship updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete an upsell relationship
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
      toast({
        title: 'Success',
        description: 'Upsell relationship deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Get upsells for a specific service
  const getUpsellsForService = (serviceId: string) => {
    if (!upsellRelationships) return [];
    return upsellRelationships.filter(
      relationship => relationship.main_service_id === serviceId
    );
  };

  // Get services that upsell a specific service
  const getServicesUpselling = (serviceId: string) => {
    if (!upsellRelationships) return [];
    return upsellRelationships.filter(
      relationship => relationship.upsell_service_id === serviceId
    );
  };

  return {
    services,
    upsellRelationships,
    isLoadingServices,
    isLoadingUpsells,
    addUpsell: addUpsellMutation.mutate,
    updateUpsell: updateUpsellMutation.mutate,
    deleteUpsell: deleteUpsellMutation.mutate,
    getUpsellsForService,
    getServicesUpselling,
    isAddingUpsell: addUpsellMutation.isPending,
    isUpdatingUpsell: updateUpsellMutation.isPending,
    isDeletingUpsell: deleteUpsellMutation.isPending
  };
};
