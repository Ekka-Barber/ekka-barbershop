
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PackageSettings } from '@/types/admin';
import { logger } from '@/utils/logger';

// Base service ID - export it so it can be imported elsewhere
export const BASE_SERVICE_ID = 'a3dbfd63-be5d-4465-af99-f25c21d578a0';

/**
 * Hook to fetch and manage package configuration settings
 * 
 * @returns Package configuration settings and status
 */
export const usePackageConfig = () => {
  // Fetch package settings with proper caching
  const { data: packageSettings } = useQuery({
    queryKey: ['package_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_settings')
        .select('*')
        .eq('base_service_id', BASE_SERVICE_ID)
        .single();
        
      if (error) {
        logger.error('Error fetching package settings:', error);
        return null;
      }
      
      return {
        baseServiceId: data.base_service_id,
        discountTiers: {
          oneService: data.discount_one_service,
          twoServices: data.discount_two_services,
          threeOrMore: data.discount_three_plus_services
        },
        maxServices: data.max_services
      } as PackageSettings;
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  // Fetch enabled services with display_order, optimized with caching
  const { data: enabledPackageServices } = useQuery({
    queryKey: ['package_available_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_available_services')
        .select('service_id, display_order')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
        
      if (error) {
        logger.error('Error fetching package available services:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.service_id,
        display_order: item.display_order
      }));
    },
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  return {
    BASE_SERVICE_ID,
    packageSettings,
    enabledPackageServices
  };
};
