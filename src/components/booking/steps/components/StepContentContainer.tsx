
import React from "react";
import { StepRenderer } from "../StepRenderer";
import { ValidationOverlay } from "./ValidationOverlay";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { SelectedService, Service } from "@/types/service";

interface StepContentContainerProps {
  isValidating: boolean;
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

export const StepContentContainer: React.FC<StepContentContainerProps> = ({
  isValidating,
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
  return (
    <div className="mb-8 relative">
      <ValidationOverlay isValidating={isValidating} />
      
      <ErrorBoundary>
        <StepRenderer 
          currentStep={currentStep}
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedServices={selectedServices}
          handleServiceToggle={handleServiceToggle}
          handleStepChange={handleStepChange}
          employees={employees}
          employeesLoading={employeesLoading}
          selectedBarber={selectedBarber}
          setSelectedBarber={setSelectedBarber}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          setSelectedDate={setSelectedDate}
          setSelectedTime={setSelectedTime}
          employeeWorkingHours={employeeWorkingHours}
          customerDetails={customerDetails}
          handleCustomerDetailsChange={handleCustomerDetailsChange}
          totalPrice={totalPrice}
          language={language}
          branch={branch}
          isUpdatingPackage={isUpdatingPackage}
          handlePackageServiceUpdate={handlePackageServiceUpdate}
          onRemoveService={onRemoveService}
          onValidationChange={onValidationChange}
        />
      </ErrorBoundary>
    </div>
  );
};
