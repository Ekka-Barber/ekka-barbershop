
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ServiceBranchAvailability } from '@/types/booking';

export const useServiceAvailability = (branchId: string | null | undefined) => {
  const [updatingServiceIds, setUpdatingServiceIds] = useState<string[]>([]);

  // Fetch service availability for the selected branch
  const { data: availabilityData, isLoading, error, refetch } = useQuery({
    queryKey: ['service-availability', branchId],
    queryFn: async (): Promise<ServiceBranchAvailability[]> => {
      if (!branchId) return [];
      
      const { data, error } = await supabase
        .from('service_branch_availability')
        .select('*')
        .eq('branch_id', branchId);
        
      if (error) {
        console.error('Error fetching service availability:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!branchId,
  });

  // Toggle a service's availability at the branch
  const toggleServiceAvailability = async (serviceId: string, isAvailable: boolean) => {
    if (!branchId) return;
    
    try {
      setUpdatingServiceIds(prev => [...prev, serviceId]);
      
      // Check if record exists
      const { data: existingRecord } = await supabase
        .from('service_branch_availability')
        .select('id')
        .eq('service_id', serviceId)
        .eq('branch_id', branchId)
        .maybeSingle();
      
      if (existingRecord) {
        // Update existing record
        await supabase
          .from('service_branch_availability')
          .update({ is_available: isAvailable })
          .eq('id', existingRecord.id);
      } else {
        // Insert new record
        await supabase
          .from('service_branch_availability')
          .insert({
            service_id: serviceId,
            branch_id: branchId,
            is_available: isAvailable
          });
      }
      
      // Refetch data
      await refetch();
    } catch (error) {
      console.error('Error toggling service availability:', error);
      throw error;
    } finally {
      setUpdatingServiceIds(prev => prev.filter(id => id !== serviceId));
    }
  };

  // Get a service's availability status
  const getServiceAvailability = (serviceId: string): boolean => {
    if (!availabilityData) return true; // Default to available
    
    const record = availabilityData.find(
      item => item.service_id === serviceId
    );
    
    return record ? record.is_available : true; // Default to available if no record
  };

  // Check service availability (returns a boolean, not a Promise)
  const isServiceAvailable = (serviceId: string): boolean => {
    return getServiceAvailability(serviceId);
  };

  return {
    availabilityData,
    isLoading,
    error,
    updatingServiceIds,
    toggleServiceAvailability,
    getServiceAvailability,
    isServiceAvailable, // Add this function to the return object
    refetch
  };
};
