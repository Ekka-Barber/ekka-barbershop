import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { AddUpsellDialog } from './upsell/AddUpsellDialog';
import { UpsellServiceList } from './upsell/UpsellServiceList';
import { UpsellVisualization } from './UpsellVisualization';
import { useServiceUpsells as originalUseServiceUpsells, useUpsellMutations } from './upsell/useServiceUpsells';
import { Service } from '@/types/service';
import { ServiceWithUpsells } from './upsell/types';

// Create a wrapper around the original hook to provide the missing properties
const useServiceUpsells = () => {
  const result = originalUseServiceUpsells();
  
  // Transform the services to include display_order property required by Service type
  const transformedServices = result.services.map(service => ({
    ...service,
    display_order: 0,
    mobile_display_order: 0,
    description_en: '',
    description_ar: '',
    discount_type: null,
    discount_value: 0
  })) as Service[];
  
  // Transform services with upsells
  const servicesWithUpsells = result.services
    .filter(service => {
      const hasUpsells = result.upsellRelationships.some(
        rel => rel.main_service_id === service.id
      );
      return hasUpsells;
    })
    .map(service => {
      const upsells = result.upsellRelationships
        .filter(rel => rel.main_service_id === service.id)
        .map(rel => ({
          id: rel.id,
          upsell: rel.upsell_service as any,
          discount_percentage: rel.discount_percentage
        }));
      
      return {
        ...service,
        display_order: 0,
        mobile_display_order: 0,
        description_en: '',
        description_ar: '',
        discount_type: null,
        discount_value: 0,
        upsells
      };
    }) as unknown as ServiceWithUpsells[];
  
  return {
    ...result,
    allServices: transformedServices,
    servicesWithUpsells,
    isLoading: result.isLoadingServices || result.isLoadingUpsells
  };
};

export const ServiceUpsellManager = () => {
  const [isAddUpsellOpen, setIsAddUpsellOpen] = useState(false);
  const { 
    servicesWithUpsells, 
    isLoading, 
    allServices 
  } = useServiceUpsells();
  
  const onSuccess = () => {
    // Invalidate queries to refetch data
  };
  
  const { 
    addUpsellMutation, 
    updateUpsellMutation, 
    deleteUpsellMutation 
  } = useUpsellMutations({ onSuccess });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Upselling</h2>
        <Button onClick={() => setIsAddUpsellOpen(true)}>Add Upsell Relationship</Button>
      </div>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : servicesWithUpsells.length === 0 ? (
        <p>No upsell relationships found. Create one to get started!</p>
      ) : (
        <>
          <UpsellVisualization services={allServices} relationships={servicesWithUpsells} />
          <UpsellServiceList 
            servicesWithUpsells={servicesWithUpsells}
            onUpdateDiscount={(id, discount) => updateUpsellMutation.mutate({ id, discount })}
            onDeleteUpsell={(id) => deleteUpsellMutation.mutate(id)}
            isUpdating={updateUpsellMutation.isPending}
            isDeleting={deleteUpsellMutation.isPending}
          />
        </>
      )}
      
      <AddUpsellDialog 
        open={isAddUpsellOpen}
        onOpenChange={setIsAddUpsellOpen}
        services={allServices}
        onSubmit={(data) => {
          addUpsellMutation.mutate(data);
          setIsAddUpsellOpen(false);
        }}
        isSubmitting={addUpsellMutation.isPending}
      />
    </div>
  );
};
