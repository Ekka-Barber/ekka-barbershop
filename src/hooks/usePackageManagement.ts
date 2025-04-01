import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/service';
import { useToast } from '@/components/ui/use-toast';
import { PackageSettings, PackageServiceToggle } from '@/types/admin';

// Base haircut service ID
const BASE_SERVICE_ID = 'a3dbfd63-be5d-4465-af99-f25c21d578a0';

export const usePackageManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize with default values
  const [packageSettings, setPackageSettings] = useState<PackageSettings>({
    baseServiceId: BASE_SERVICE_ID,
    discountTiers: {
      oneService: 15,
      twoServices: 20,
      threeOrMore: 30
    },
    maxServices: null
  });
  
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [baseService, setBaseService] = useState<Service | null>(null);

  // Fetch all services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      return data as Service[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch package settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['package_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_settings')
        .select('*')
        .eq('base_service_id', BASE_SERVICE_ID)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, we'll create default ones
          return null;
        }
        throw error;
      }
      
      return data;
    },
    refetchOnMount: true
  });

  // Fetch enabled services with their display order
  const { data: enabledServicesData, isLoading: enabledServicesLoading } = useQuery({
    queryKey: ['package_available_services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('package_available_services')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Process data when it's loaded
  useEffect(() => {
    if (settingsData) {
      setPackageSettings({
        baseServiceId: settingsData.base_service_id,
        discountTiers: {
          oneService: settingsData.discount_one_service,
          twoServices: settingsData.discount_two_services,
          threeOrMore: settingsData.discount_three_plus_services
        },
        maxServices: settingsData.max_services
      });
    }
    
    if (enabledServicesData) {
      setEnabledServices(enabledServicesData.map(item => item.service_id));
    }
    
    if (services) {
      const base = services.find(s => s.id === BASE_SERVICE_ID);
      if (base) {
        setBaseService(base);
      }
    }
  }, [settingsData, enabledServicesData, services]);

  // Save package settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: PackageSettings) => {
      // Check if settings exist
      const { data: existingSettings } = await supabase
        .from('package_settings')
        .select('id')
        .eq('base_service_id', settings.baseServiceId)
        .single();
      
      if (existingSettings) {
        // Update
        const { error } = await supabase
          .from('package_settings')
          .update({
            discount_one_service: settings.discountTiers.oneService,
            discount_two_services: settings.discountTiers.twoServices,
            discount_three_plus_services: settings.discountTiers.threeOrMore,
            max_services: settings.maxServices
          })
          .eq('base_service_id', settings.baseServiceId);
          
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('package_settings')
          .insert({
            base_service_id: settings.baseServiceId,
            discount_one_service: settings.discountTiers.oneService,
            discount_two_services: settings.discountTiers.twoServices,
            discount_three_plus_services: settings.discountTiers.threeOrMore,
            max_services: settings.maxServices
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package_settings'] });
      toast({
        title: "Success",
        description: "Package settings saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving package settings:', error);
      toast({
        title: "Error",
        description: "Failed to save package settings.",
        variant: "destructive",
      });
    }
  });

  // Toggle service availability
  const toggleServiceMutation = useMutation({
    mutationFn: async ({ serviceId, enabled }: PackageServiceToggle) => {
      // Check if the service exists in the table
      const { data: existingService } = await supabase
        .from('package_available_services')
        .select('id, display_order')
        .eq('service_id', serviceId)
        .single();
      
      if (existingService) {
        // Update
        const { error } = await supabase
          .from('package_available_services')
          .update({ enabled })
          .eq('service_id', serviceId);
          
        if (error) throw error;
      } else {
        // Get max display order for new enabled service
        const { data } = await supabase
          .from('package_available_services')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);
          
        const nextOrder = data && data.length > 0 ? data[0].display_order + 1 : 0;
        
        // Insert with sequential numbering
        const { error } = await supabase
          .from('package_available_services')
          .insert({
            service_id: serviceId,
            enabled,
            display_order: nextOrder
          });
          
        if (error) throw error;
      }
    },
    onMutate: async ({ serviceId, enabled }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['package_available_services'] });
      
      // Optimistically update the local state
      if (enabled) {
        setEnabledServices(prev => [...prev, serviceId]);
      } else {
        setEnabledServices(prev => prev.filter(id => id !== serviceId));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package_available_services'] });
    },
    onError: (error) => {
      console.error('Error toggling service:', error);
      toast({
        title: "Error",
        description: "Failed to update service availability.",
        variant: "destructive",
      });
      // Reset the enabledServices state from the server data
      if (enabledServicesData) {
        setEnabledServices(enabledServicesData.map(item => item.service_id));
      }
    }
  });

  // Update service order mutation 
  const updateServiceOrderMutation = useMutation({
    mutationFn: async ({ serviceId, newDisplayOrder }: { serviceId: string, newDisplayOrder: number }) => {
      console.log(`Updating service ${serviceId} to display order ${newDisplayOrder}`);
      
      // Add the branch manager code RPC call for authorization
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      
      const { error } = await supabase
        .from('package_available_services')
        .update({ display_order: newDisplayOrder })
        .eq('service_id', serviceId);
        
      if (error) {
        console.error("Error updating service order:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Don't immediately invalidate the query which could cause a race condition
      // We'll do this once all updates are complete
    },
    onError: (error) => {
      console.error('Error updating service order:', error);
      toast({
        title: "Error",
        description: "Failed to update service order.",
        variant: "destructive",
      });
    }
  });

  // Update package settings
  const updatePackageSettings = (newSettings: Partial<PackageSettings>) => {
    setPackageSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Toggle a service
  const toggleService = (serviceId: string) => {
    const isCurrentlyEnabled = enabledServices.includes(serviceId);
    const newEnabledValue = !isCurrentlyEnabled;
    
    // Send to server (optimistic update handled by the mutation)
    toggleServiceMutation.mutate({
      serviceId,
      enabled: newEnabledValue
    });
  };

  // Reorder services - simplified to use sequential ordering
  const reorderServices = async (sourceIndex: number, destinationIndex: number) => {
    // Only reorder if we have enabled services data
    if (!enabledServicesData || enabledServicesData.length === 0) return;
    
    console.log(`Reordering service from position ${sourceIndex} to ${destinationIndex}`);
    
    // Create a new array from the enabled services sorted by display_order
    const sortedServices = [...enabledServicesData].sort((a, b) => a.display_order - b.display_order);
    
    // Extract moved item and remove from array
    const movedItem = sortedServices[sourceIndex];
    const newOrder = [...sortedServices];
    newOrder.splice(sourceIndex, 1);
    
    // Insert at destination
    newOrder.splice(destinationIndex, 0, movedItem);
    
    // Optimistically update UI
    const updatedServicesData = newOrder.map((service, index) => ({
      ...service,
      display_order: index
    }));
    
    // Update local cache optimistically
    queryClient.setQueryData(['package_available_services'], updatedServicesData);
    
    try {
      // Add branch manager code RPC call for authorization
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      
      // Get all relevant records to update
      const { data: currentServices, error: fetchError } = await supabase
        .from('package_available_services')
        .select('*')
        .in('service_id', updatedServicesData.map(s => s.service_id));
      
      if (fetchError) throw fetchError;
      
      // Create the updates with complete records
      const mergedUpdates = updatedServicesData.map(service => {
        const current = currentServices?.find(s => s.service_id === service.service_id);
        if (!current) {
          console.error(`Service ${service.service_id} not found in database`);
          return null;
        }
        return {
          ...current,
          display_order: service.display_order
        };
      }).filter(Boolean);

      console.log('Upserting all services with new display orders in a single operation');
      
      // Perform a single bulk upsert operation
      const { error } = await supabase
        .from('package_available_services')
        .upsert(mergedUpdates);
      
      if (error) throw error;
      
      // Individual updates for logging purposes only
      for (const update of updatedServicesData) {
        console.log(`Service ${update.service_id} updated to display order ${update.display_order}`);
      }
      
      // Now that all updates are complete, invalidate the query to refresh data
      queryClient.invalidateQueries({ queryKey: ['package_available_services'] });
      
      toast({
        title: "Success",
        description: "Service order has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update service orders:", error);
      toast({
        title: "Error",
        description: "Failed to update service order.",
        variant: "destructive",
      });
      
      // Revert the optimistic update by fetching fresh data
      queryClient.invalidateQueries({ queryKey: ['package_available_services'] });
    }
  };

  // Save all settings
  const saveSettings = () => {
    saveSettingsMutation.mutate(packageSettings);
  };

  // Check if a service is the base service
  const isBaseService = (serviceId: string) => {
    return serviceId === BASE_SERVICE_ID;
  };

  // Check if a service is enabled
  const isServiceEnabled = (serviceId: string) => {
    return enabledServices.includes(serviceId);
  };

  return {
    services,
    baseService,
    packageSettings,
    enabledServicesData,
    isLoading: servicesLoading || settingsLoading || enabledServicesLoading,
    isSaving: saveSettingsMutation.isPending || toggleServiceMutation.isPending || updateServiceOrderMutation.isPending,
    updatePackageSettings,
    toggleService,
    reorderServices,
    saveSettings,
    isBaseService,
    isServiceEnabled
  };
};
