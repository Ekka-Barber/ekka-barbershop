
import React from 'react';
import { ServiceSelection } from '../ServiceSelection';
import { DateTimeSelection } from '../DateTimeSelection';
import { BarberSelection } from '../BarberSelection';
import { CustomerForm } from '../CustomerForm';
import { BookingSummary } from '../BookingSummary';
import { SelectedService, Service } from '@/types/service';

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
  onRemoveService
}) => {
  const renderStep = () => {
    switch (currentStep) {
      case 'services':
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
        return (
          <DateTimeSelection
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            services={selectedServices}
          />
        );
      case 'barber':
        return (
          <BarberSelection
            employees={employees}
            isLoading={employeesLoading}
            selectedBarber={selectedBarber}
            onSelectBarber={setSelectedBarber}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            workingHours={employeeWorkingHours}
            requiredDuration={selectedServices.reduce((total, service) => total + (service.duration || 0), 0)}
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
              formData={customerDetails}
              onChange={handleCustomerDetailsChange}
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
