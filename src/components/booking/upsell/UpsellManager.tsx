
import React from 'react';

export interface UpsellManagerProps {
  // Define the props that this component actually needs
  onStepChange?: (step: any) => void;
}

export const UpsellManager: React.FC<UpsellManagerProps> = ({ onStepChange }) => {
  return (
    <div className="p-4 border rounded-lg my-4">
      <h3 className="text-lg font-semibold mb-3">Suggested Additions</h3>
      <p className="text-muted-foreground mb-4">
        Consider adding these complementary services to enhance your experience.
      </p>
      
      {onStepChange && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => onStepChange('services')}
            className="px-4 py-2 text-sm text-gray-600 border rounded"
          >
            Back to Services
          </button>
          <button
            onClick={() => onStepChange('confirmation')}
            className="px-4 py-2 text-sm bg-primary text-white rounded"
          >
            Continue to Confirmation
          </button>
        </div>
      )}
    </div>
  );
};

export default UpsellManager;
