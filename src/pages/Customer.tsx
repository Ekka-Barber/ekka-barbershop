import React, { useState, useEffect } from 'react';
import { useUIElements, UIElement } from '@/hooks/useUIElements';
import { useElementAnimation } from '@/hooks/useElementAnimation';
import { UIElementRenderer } from '@/components/customer/ui/UIElementRenderer';

const Customer: React.FC = () => {
  // State for different dialogs
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isEidDialogOpen, setIsEidDialogOpen] = useState(false);
  
  // Get UI elements and their animation states
  const { elements, isLoading, error } = useUIElements();
  const { isAnimating, animatingElements } = useElementAnimation(elements);

  // Handle dialog open events
  const handleOpenBranchDialog = () => {
    setIsBranchDialogOpen(true);
  };

  const handleOpenLocationDialog = () => {
    setIsLocationDialogOpen(true);
  };

  const handleOpenEidDialog = () => {
    setIsEidDialogOpen(true);
  };

  // If there's an error loading UI elements
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="mt-2 text-gray-600">
            We're having trouble loading this page. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-primary-900 to-primary-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Our Services</h1>
          <p className="text-xl mb-8">
            Fast, reliable, and professional service at your fingertips.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleOpenBranchDialog}
              className="bg-white text-primary-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Find a Branch
            </button>
            <button
              onClick={handleOpenLocationDialog}
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our range of professional services designed for your convenience and satisfaction.
          </p>
        </div>

        <UIElementRenderer
          elements={elements}
          animatingElements={animatingElements}
          isLoading={isLoading}
          onOpenBranchDialog={handleOpenBranchDialog}
          onOpenLocationDialog={handleOpenLocationDialog}
          onOpenEidDialog={handleOpenEidDialog}
        />
      </section>

      {/* Dialog placeholders - actual implementation would use proper dialog components */}
      {isBranchDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Branch Selector</h2>
            <p>Dialog content here...</p>
            <button
              onClick={() => setIsBranchDialogOpen(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Similar dialog placeholders for location and EID */}
      {isLocationDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Location Selector</h2>
            <p>Dialog content here...</p>
            <button
              onClick={() => setIsLocationDialogOpen(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isEidDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">EID Verification</h2>
            <p>Dialog content here...</p>
            <button
              onClick={() => setIsEidDialogOpen(false)}
              className="mt-4 bg-gray-200 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customer;
