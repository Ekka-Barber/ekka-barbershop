
import React, { useEffect, useState } from 'react';
import { ServiceSelection } from '../ServiceSelection';
import { DateTimeSelection } from '../DateTimeSelection';
import { BarberSelection } from '../BarberSelection';
import { CustomerForm } from '../CustomerForm';
import { BookingSummary } from '../BookingSummary';
import { SelectedService, Service } from '@/types/service';
import { ServicesSkeleton } from '../ServicesSkeleton';
import { DateTimeSelectionSkeleton } from '../DateTimeSelectionSkeleton';
import { BarberSelectionSkeleton } from '../BarberSelectionSkeleton';

interface StepRendererProps {
  currentStep: string;
  categories: any[] | undefined;
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  handleServiceToggle: (service: any) => void;
  handleStepChange: (step: string) => void;
  employees: any[] | undefined;
  employeesLoading: boolean;
  selectedBarber: string | undefined;
  setSelectedBarber: (barberId: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  employeeWorkingHours: any;
  customerDetails: any;
  handleCustomerDetailsChange: (name: string, value: string) => void;
  totalPrice: number;
  language: string;
  branch: any;
  isUpdatingPackage?: boolean;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
  onRemoveService?: (serviceId: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  categories,
  categoriesLoading,
  selectedServices,
  handleServiceToggle,
  handleStepChange,
  employees,
  employeesLoading,
  selectedBarber,
  setSelectedBarber,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  employeeWorkingHours,
  customerDetails,
  handleCustomerDetailsChange,
  totalPrice,
  language,
  branch,
  isUpdatingPackage,
  handlePackageServiceUpdate,
  onRemoveService,
  onValidationChange
}) => {
  // Local state to track form validation before propagating up
  const [isFormValid, setIsFormValid] = useState(false);
  
  const handleFormValidationChange = (isValid: boolean) => {
    console.log("StepRenderer: Form validation changed to:", isValid);
    setIsFormValid(isValid);
    
    // Propagate validation state up
    if (onValidationChange) {
      console.log("StepRenderer: Calling parent onValidationChange with:", isValid);
      onValidationChange(isValid);
    }
  };
  
  // Force re-validation when customer details change
  useEffect(() => {
    if (currentStep === 'details' && customerDetails) {
      // This will cause the CustomerForm to re-evaluate and call handleFormValidationChange
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^05\d{8}$/;
      
      const isNameValid = customerDetails.name && customerDetails.name.trim() !== '';
      const isPhoneValid = customerDetails.phone && phoneRegex.test(customerDetails.phone);
      const isEmailValid = customerDetails.email && emailRegex.test(customerDetails.email);
      
      const isValid = isNameValid && isPhoneValid && isEmailValid;
      
      console.log("StepRenderer: Direct validation check:", { 
        name: isNameValid, 
        phone: isPhoneValid, 
        email: isEmailValid,
        overall: isValid
      });
      
      if (isValid !== isFormValid) {
        handleFormValidationChange(isValid);
      }
    }
  }, [currentStep, customerDetails, isFormValid]);

  const renderStep = () => {
    switch (currentStep) {
      case 'services':
        if (categoriesLoading) {
          return <ServicesSkeleton />;
        }
        return (
          <ServiceSelection
            categories={categories}
            isLoading={categoriesLoading}
            selectedServices={selectedServices}
            onServiceToggle={handleServiceToggle}
            onStepChange={handleStepChange}
            isUpdatingPackage={isUpdatingPackage}
            handlePackageServiceUpdate={handlePackageServiceUpdate}
          />
        );
      case 'datetime':
        if (!selectedDate && !categories) {
          return <DateTimeSelectionSkeleton />;
        }
        return (
          <DateTimeSelection
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        );
      case 'barber':
        if (employeesLoading) {
          return <BarberSelectionSkeleton />;
        }
        return (
          <BarberSelection
            employees={employees}
            isLoading={employeesLoading}
            selectedBarber={selectedBarber}
            onBarberSelect={setSelectedBarber}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
          />
        );
      case 'details':
        const selectedBarberName = employees?.find(e => e.id === selectedBarber)?.name || '';
        
        return (
          <div className="space-y-6">
            <BookingSummary
              selectedServices={selectedServices}
              totalPrice={totalPrice}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedBarberName={selectedBarberName}
              onRemoveService={onRemoveService}
              availableServices={categories?.flatMap(c => c.services)}
              onAddService={handleServiceToggle}
              isDetailsStep={true}
            />

            <CustomerForm
              customerDetails={customerDetails}
              onCustomerDetailsChange={handleCustomerDetailsChange}
              onValidationChange={handleFormValidationChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {renderStep()}
    </div>
  );
};
