
import React from 'react';
import { ServiceStep } from './ServiceStep';
import { DateTimeStep } from './DateTimeStep';
import { BarberStep } from './BarberStep';
import { DetailsStep } from './DetailsStep';
import { BookingStep } from '../BookingProgress';
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { Service, SelectedService } from '@/types/service';

interface StepRendererProps {
  currentStep: BookingStep;
  categories: { services: Service[]; id: string; name_en: string; name_ar: string; display_order: number; }[];
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
      return (
        <DateTimeStep
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      );
    case 'barber':
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
      return (
        <DetailsStep
          customerDetails={customerDetails}
          handleCustomerDetailsChange={handleCustomerDetailsChange}
          totalPrice={totalPrice}
          branch={branch}
        />
      );
    default:
      return null;
  }
};
