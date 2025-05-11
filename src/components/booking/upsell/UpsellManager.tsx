
import React from 'react';
import { useBookingUpsells } from '@/hooks/useBookingUpsells';
import { SelectedService } from '@/types/service';

interface UpsellManagerProps {
  selectedServices: SelectedService[];
  // Add other props as needed
}

export const UpsellManager: React.FC<UpsellManagerProps> = ({ selectedServices }) => {
  const selectedServiceIds = selectedServices.map(service => service.id);
  
  const {
    upsellServices,
    isLoading,
    error,
    originalPrice,
    discountedPrice,
    calculateTotalSavings,
    calculatePercentageSaved
  } = useBookingUpsells(selectedServiceIds);

  // Handle loading and error states
  if (isLoading) {
    return <div>Loading upsell recommendations...</div>;
  }
  
  if (error) {
    return <div>Error loading upsell services</div>;
  }
  
  if (upsellServices.length === 0) {
    return null; // No upsells available
  }

  // Render upsell services
  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-2">Recommended Services</h3>
      <div className="space-y-3">
        {upsellServices.map(service => (
          <div key={service.id} className="p-3 border rounded-md flex justify-between items-center">
            <div>
              <div className="font-medium">{service.name_en}</div>
              <div className="text-sm text-gray-500">{service.duration} min</div>
            </div>
            <div className="text-right">
              <div className="line-through text-sm text-gray-500">{service.price} SAR</div>
              <div className="font-bold text-green-600">
                {(service.price * (100 - service.discount_percentage) / 100).toFixed(2)} SAR
              </div>
              <div className="text-xs text-green-500">Save {service.discount_percentage}%</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-gray-50 rounded-md">
        <div className="flex justify-between">
          <span>Total savings:</span>
          <span className="font-bold text-green-600">{calculateTotalSavings().toFixed(2)} SAR</span>
        </div>
      </div>
    </div>
  );
};

export default UpsellManager;
