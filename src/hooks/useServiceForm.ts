
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Service } from '@/types/service';

export const useServiceForm = (onSuccess: () => void) => {
  const [newService, setNewService] = useState<Partial<Service>>({
    category_id: '',
    name_en: '',
    name_ar: '',
    description_en: null,
    description_ar: null,
    duration: 0,
    price: 0,
    discount_type: null,
    discount_value: null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addServiceMutation = useMutation({
    mutationFn: async (service: Partial<Service>) => {
      if (!service.category_id || !service.name_en || !service.name_ar || 
          service.duration === undefined || service.price === undefined) {
        throw new Error('Missing required fields');
      }

      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('services')
        .insert({
          category_id: service.category_id,
          name_en: service.name_en,
          name_ar: service.name_ar,
          description_en: service.description_en,
          description_ar: service.description_ar,
          duration: service.duration,
          price: service.price,
          discount_type: service.discount_type,
          discount_value: service.discount_value,
          display_order: 0 // Will be updated by the backend
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      setNewService({
        category_id: '',
        name_en: '',
        name_ar: '',
        description_en: null,
        description_ar: null,
        duration: 0,
        price: 0,
        discount_type: null,
        discount_value: null,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        description: "Failed to add service",
        variant: "destructive",
      });
      console.error('Add error:', error);
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (service: Partial<Service>) => {
      if (!service.id || !service.category_id || !service.name_en || !service.name_ar || 
          service.duration === undefined || service.price === undefined) {
        throw new Error('Missing required fields');
      }

      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('services')
        .update({
          category_id: service.category_id,
          name_en: service.name_en,
          name_ar: service.name_ar,
          description_en: service.description_en,
          description_ar: service.description_ar,
          duration: service.duration,
          price: service.price,
          discount_type: service.discount_type,
          discount_value: service.discount_value,
        })
        .eq('id', service.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      setNewService({
        category_id: '',
        name_en: '',
        name_ar: '',
        description_en: null,
        description_ar: null,
        duration: 0,
        price: 0,
        discount_type: null,
        discount_value: null,
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        description: "Failed to update service",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  return {
    newService,
    setNewService,
    addService: addServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    isLoading: addServiceMutation.isPending || updateServiceMutation.isPending
  };
};
