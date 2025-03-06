
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Service } from '@/types/service';
import { ServiceWithUpsells } from './types';

export const useServiceUpsells = () => {
  // Fetch all services for dropdown selection
  const { data: allServices } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name_en');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  // Fetch services with their upsells
  const { data: servicesWithUpsells, isLoading } = useQuery({
    queryKey: ['services-with-upsells'],
    queryFn: async () => {
      // First get all services that have upsells configured
      const { data: upsellRelations, error: upsellError } = await supabase
        .from('service_upsells')
        .select(`
          id,
          main_service_id,
          upsell_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (*)
        `);

      if (upsellError) throw upsellError;

      // Get unique main service IDs
      const mainServiceIds = [...new Set(upsellRelations.map(rel => rel.main_service_id))];

      // Fetch details of the main services
      const { data: mainServices, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .in('id', mainServiceIds);

      if (servicesError) throw servicesError;

      // Group upsells by main service
      const servicesMap: Record<string, ServiceWithUpsells> = {};
      
      mainServices.forEach(service => {
        servicesMap[service.id] = {
          ...service,
          upsells: []
        };
      });

      upsellRelations.forEach(relation => {
        if (servicesMap[relation.main_service_id]) {
          servicesMap[relation.main_service_id].upsells!.push({
            ...relation,
            upsell: relation.upsell as Service
          });
        }
      });

      return Object.values(servicesMap);
    }
  });

  return {
    allServices,
    servicesWithUpsells,
    isLoading
  };
};
