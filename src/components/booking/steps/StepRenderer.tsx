
import React from 'react';
import { ServiceStep } from './ServiceStep';
import { DateTimeStep } from './DateTimeStep';
import { BarberStep } from './BarberStep';
import { DetailsStep } from './DetailsStep';
import { BookingStep } from '../BookingProgress';
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { Service, SelectedService, Category } from '@/types/service';
import { useBookingContext } from '@/contexts/BookingContext';

interface StepRendererProps {
  currentStep: BookingStep;
  categories: Category[];
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  handleServiceToggle: (service: Service) => void;
  handleStepChange: (step: BookingStep) => void;
  employees: Employee[];
  employeesLoading: boolean;
  selectedBarber: Employee | null;
  setSelectedBarber: (barber: Employee) => void;
  selectedDate: Date | undefined;
  selectedTime: string;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (time: string) => void;
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  totalPrice: number;
  language: string;
  branch: Branch;
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
  customerDetails,
  handleCustomerDetailsChange,
  totalPrice,
  language,
  branch
}) => {
  const { state } = useBookingContext();

  // Ensure we have the required data for each step
  if (!branch) {
    console.error('Branch not found in StepRenderer');
    return null;
  }

  switch (currentStep) {
    case 'services':
      return (
        <ServiceStep
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedServices={selectedServices}
          handleServiceToggle={handleServiceToggle}
          handleStepChange={handleStepChange}
        />
      );
    case 'datetime':
      if (selectedServices.length === 0) {
        console.error('No services selected for datetime step');
        handleStepChange('services');
        return null;
      }
      return (
        <DateTimeStep
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      );
    case 'barber':
      if (!selectedDate) {
        console.error('No date selected for barber step');
        handleStepChange('datetime');
        return null;
      }
      return (
        <BarberStep
          employees={employees}
          isLoading={employeesLoading}
          selectedBarber={selectedBarber?.id}
          onBarberSelect={(id) => {
            const barber = employees.find(e => e.id === id);
            if (barber) setSelectedBarber(barber);
          }}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
        />
      );
    case 'details':
      if (!selectedBarber || !selectedTime) {
        console.error('Missing barber or time for details step');
        handleStepChange('barber');
        return null;
      }
      return (
        <DetailsStep
          customerDetails={customerDetails}
          onCustomerDetailsChange={handleCustomerDetailsChange}
          totalPrice={totalPrice}
          branch={branch}
        />
      );
    default:
      return null;
  }
};
