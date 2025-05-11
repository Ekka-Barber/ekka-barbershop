
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  category_id: string;
  description_en?: string;
  description_ar?: string;
}

export interface UpsellRelationship {
  id: string;
  main_service_id: string;
  upsell_service_id: string;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  main_service?: Service;
  upsell_service?: Service;
}

export interface ServiceWithUpsells extends Service {
  upsells: {
    id: string;
    upsell_service: Service;
    discount_percentage: number;
  }[];
}

export const useServiceUpsells = () => {
  const { toast } = useToast();
  
  // Fetch all services
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name_en, name_ar, category_id, price, duration, category:category_id(id, name_en)');
      
      if (error) throw error;
      return data as Service[];
    }
  });
  
  // Fetch all upsell relationships
  const { data: upsellRelationships = [], isLoading: isLoadingUpsells } = useQuery({
    queryKey: ['service-upsells'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_upsells')
        .select('*, main_service:main_service_id(*), upsell_service:upsell_service_id(*)');
      
      if (error) throw error;
      return data as UpsellRelationship[];
    }
  });
  
  return {
    services,
    upsellRelationships,
    isLoadingServices,
    isLoadingUpsells
  };
};

export const useUpsellMutations = ({ onSuccess }: { onSuccess: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addUpsellMutation = useMutation({
    mutationFn: async ({ mainServiceId, upsellItems }: any) => {
      if (!mainServiceId || !upsellItems || upsellItems.length === 0) {
        throw new Error('Missing required data for upsell creation');
      }
      
      // Check for duplicates
      const insertPromises = [];
      
      for (const item of upsellItems) {
        const { upsellServiceId, discountPercentage } = item;
        
        // Check if relation already exists
        const { data: existing, error: checkError } = await supabase
          .from('service_upsells')
          .select('id')
          .eq('main_service_id', mainServiceId)
          .eq('upsell_service_id', upsellServiceId)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existing) {
          throw new Error(`This upsell relationship already exists`);
        }
        
        insertPromises.push(
          supabase.from('service_upsells').insert({
            main_service_id: mainServiceId,
            upsell_service_id: upsellServiceId,
            discount_percentage: discountPercentage
          })
        );
      }
      
      const results = await Promise.all(insertPromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error(errors[0].error?.message || 'Failed to create upsell relationship');
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Upsell created",
        description: "The upsell relationship has been created successfully."
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create upsell",
        description: error.message
      });
    }
  });
  
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, discount }: { id: string, discount: number }) => {
      const { data, error } = await supabase
        .from('service_upsells')
        .update({
          discount_percentage: discount
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Upsell updated",
        description: "The discount has been updated successfully."
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update upsell",
        description: error.message
      });
    }
  });
  
  const deleteUpsellMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_upsells')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Upsell deleted",
        description: "The upsell relationship has been removed."
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['service-upsells'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete upsell",
        description: error.message
      });
    }
  });
  
  return {
    addUpsellMutation,
    updateUpsellMutation,
    deleteUpsellMutation
  };
};
