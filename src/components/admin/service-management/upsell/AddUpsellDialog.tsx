import React from 'react';
import { Service } from '@/types/service';

export interface AddUpsellDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export const AddUpsellDialog: React.FC<AddUpsellDialogProps> = ({
  isOpen,
  onOpenChange,
  services,
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <div>
      {/* Placeholder implementation */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-md p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Add Upsell Relationship</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border rounded mr-2"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  onSubmit({ 
                    mainServiceId: services[0]?.id, 
                    upsellServiceId: services[1]?.id,
                    discountPercentage: 10
                  });
                }}
                className="px-4 py-2 bg-primary text-white rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
