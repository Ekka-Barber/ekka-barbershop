
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
    }
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
    }
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
    }
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
        // Get max display order to place new enabled service at the end
        const { data: highestOrder } = await supabase
          .from('package_available_services')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1)
          .single();
          
        const newDisplayOrder = (highestOrder?.display_order || 0) + 10;
        
        // Insert
        const { error } = await supabase
          .from('package_available_services')
          .insert({
            service_id: serviceId,
            enabled,
            display_order: newDisplayOrder
          });
          
        if (error) throw error;
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
    }
  });

  // Reorder services mutation
  const reorderServicesMutation = useMutation({
    mutationFn: async ({ services }: { services: { service_id: string, display_order: number }[] }) => {
      console.log("Reordering services:", services);
      
      // Update multiple items in a batch
      const { error } = await supabase
        .from('package_available_services')
        .upsert(
          services.map(s => ({
            service_id: s.service_id,
            display_order: s.display_order,
            enabled: true
          })),
          { onConflict: 'service_id' }
        );
        
      if (error) {
        console.error("Error in reordering:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package_available_services'] });
      toast({
        title: "Success",
        description: "Service order updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error reordering services:', error);
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
    
    // Optimistically update UI
    if (newEnabledValue) {
      setEnabledServices(prev => [...prev, serviceId]);
    } else {
      setEnabledServices(prev => prev.filter(id => id !== serviceId));
    }
    
    // Send to server
    toggleServiceMutation.mutate({
      serviceId,
      enabled: newEnabledValue
    });
  };

  // Reorder services
  const reorderServices = (sourceIndex: number, destinationIndex: number) => {
    // Only reorder if we have enabled services data
    if (!enabledServicesData || enabledServicesData.length === 0) return;
    
    // Create a copy of enabled services
    const reorderedServices = [...enabledServicesData];
    
    // Remove the item from its original position
    const [movedItem] = reorderedServices.splice(sourceIndex, 1);
    
    // Insert the item at its new position
    reorderedServices.splice(destinationIndex, 0, movedItem);
    
    // Update display_order values (use increments of 10 to allow for future insertions)
    const updatedServices = reorderedServices.map((service, index) => ({
      service_id: service.service_id,
      display_order: (index + 1) * 10
    }));
    
    console.log("Reordering from:", sourceIndex, "to:", destinationIndex);
    console.log("Updated services:", updatedServices);
    
    // Send to server
    reorderServicesMutation.mutate({ services: updatedServices });
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
    isSaving: saveSettingsMutation.isPending || toggleServiceMutation.isPending || reorderServicesMutation.isPending,
    updatePackageSettings,
    toggleService,
    reorderServices,
    saveSettings,
    isBaseService,
    isServiceEnabled
  };
};
