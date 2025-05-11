
import React from 'react';
import { Service } from '@/types/service';
import { ServiceWithUpsells } from './types';

export interface UpsellServiceListProps {
  servicesWithUpsells: ServiceWithUpsells[];
  onUpdateDiscount: (id: string, discount: number) => void;
  onDeleteUpsell: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const UpsellServiceList: React.FC<UpsellServiceListProps> = ({ 
  servicesWithUpsells,
  onUpdateDiscount,
  onDeleteUpsell,
  isUpdating = false,
  isDeleting = false
}) => {
  return (
    <div className="space-y-4">
      {servicesWithUpsells.map((service) => (
        <div key={service.id} className="border rounded-md p-4">
          <h3 className="font-semibold">{service.name_en}</h3>
          <div className="mt-2">
            {service.upsells && service.upsells.length > 0 ? (
              <table className="w-full mt-2">
                <thead>
                  <tr className="text-left text-sm">
                    <th className="pb-2">Upsell Service</th>
                    <th className="pb-2">Discount %</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {service.upsells.map((upsell) => (
                    <tr key={upsell.id} className="border-t">
                      <td className="py-2">{upsell.upsell.name_en}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          value={upsell.discount_percentage}
                          onChange={(e) => onUpdateDiscount(upsell.id, Number(e.target.value))}
                          className="w-16 p-1 border rounded"
                          min="0"
                          max="100"
                          disabled={isUpdating}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => onDeleteUpsell(upsell.id)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          disabled={isDeleting}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">No upsells defined</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
