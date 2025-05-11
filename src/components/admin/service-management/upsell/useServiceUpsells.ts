
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
  
  // Transform the data for the component
  const servicesWithUpsells: ServiceWithUpsells[] = services.map(service => {
    const serviceUpsells = upsellRelationships
      .filter(rel => rel.main_service_id === service.id)
      .map(rel => ({
        id: rel.id,
        upsell_service: rel.upsell_service as Service,
        discount_percentage: rel.discount_percentage
      }));
    
    return {
      ...service,
      upsells: serviceUpsells
    };
  }).filter(service => service.upsells.length > 0);
  
  return {
    services,
    upsellRelationships,
    isLoadingServices,
    isLoadingUpsells,
    isLoading: isLoadingServices || isLoadingUpsells,
    servicesWithUpsells,
    allServices: services
  };
};

export const useUpsellMutations = ({ onSuccess }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addUpsellMutation = useMutation({
    mutationFn: async ({ mainServiceId, upsellServiceId, discountPercentage }) => {
      const { data, error } = await supabase
        .from('service_upsells')
        .insert({
          main_service_id: mainServiceId,
          upsell_service_id: upsellServiceId,
          discount_percentage: discountPercentage
        })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Upsell created",
        description: "The upsell relationship has been created successfully."
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create upsell",
        description: error.message
      });
    }
  });
  
  const updateUpsellMutation = useMutation({
    mutationFn: async ({ id, discount }) => {
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
      onSuccess?.();
    },
    onError: (error) => {
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
      onSuccess?.();
    },
    onError: (error) => {
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
