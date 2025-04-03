
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { PackageBuilderDialog } from "./package-builder/PackageBuilderDialog";
import { useBookingContext } from "@/contexts/BookingContext";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { SelectedService } from "@/types/service";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useRetry } from "@/hooks/useRetry";
import { BookingModals } from "./components/BookingModals";
import { useBookingStepTransition } from "./hooks/useBookingStepTransition";
import { useServiceRemoval } from "./hooks/useServiceRemoval";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { executeWithRetry } = useRetry();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  const [retryingOperation, setRetryingOperation] = useState<boolean>(false);

  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    setSelectedServices,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedBarber,
    setSelectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageServiceUpdate,
    isUpdatingPackage,
    totalPrice,
    totalDuration
  } = useBookingContext();

  const {
    data: availableUpsells
  } = useBookingUpsells(selectedServices, language);

  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    packageSettings, 
    hasBaseService,
    enabledPackageServices,
    applyPackageDiscounts
  } = usePackageDiscount(selectedServices);

  const baseService = selectedServices.find(s => s.id === BASE_SERVICE_ID) || 
    (categories?.flatMap(c => c.services).find(s => s.id === BASE_SERVICE_ID));

  const availablePackageServices = categories?.flatMap(c => c.services)
    .filter(service => 
      service.id !== BASE_SERVICE_ID && 
      enabledPackageServices?.some(enabledService => enabledService.id === service.id)
    ) || [];

  const { handleServiceRemove } = useServiceRemoval({
    selectedServices,
    setSelectedServices,
    BASE_SERVICE_ID,
    packageEnabled,
    applyPackageDiscounts,
    toast,
    language
  });

  const { 
    handleStepChange,
    validateStep,
    handleNextStep,
    handlePrevStep
  } = useBookingStepTransition({
    currentStep,
    setCurrentStep,
    selectedServices,
    selectedDate,
    selectedBarber,
    selectedTime,
    hasBaseService,
    packageSettings,
    availablePackageServices,
    availableUpsells,
    setShowPackageBuilder,
    setShowUpsellModal,
    setPendingStep,
    toast,
    language,
    navigate
  });

  const handleUpsellModalClose = () => {
    setShowUpsellModal(false);
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    handleUpsellModalClose();
  };

  const handlePackageBuilderClose = () => {
    setShowPackageBuilder(false);
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  const handlePackageBuilderConfirm = async (packageServices: SelectedService[]) => {
    try {
      setRetryingOperation(true);
      
      await executeWithRetry(
        async () => {
          const incomingBaseService = packageServices.find(s => s.isBasePackageService || s.id === BASE_SERVICE_ID);
          if (!incomingBaseService) {
            throw new Error('No base service found in package services');
          }
          
          if (handlePackageServiceUpdate) {
            console.log('Using optimized package update in BookingSteps');
            handlePackageServiceUpdate(packageServices);
            handlePackageBuilderClose();
            return;
          }
          
          console.log('Using legacy package update in BookingSteps');
          
          const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
          const nonUpsellServices = selectedServices.filter(s => !s.isUpsellItem);
          for (const service of nonUpsellServices) {
            handleServiceToggle(service);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('Adding base service first:', incomingBaseService.id);
          handleServiceToggle(incomingBaseService);
          
          const addOnServices = packageServices.filter(s => !s.isBasePackageService && s.id !== BASE_SERVICE_ID);
          for (const service of addOnServices) {
            console.log('Adding addon service:', service.id);
            handleServiceToggle(service);
          }
          
          const upsellsToAdd = existingUpsells.filter(upsell => 
            !selectedServices.some(s => s.id === upsell.id)
          );
          
          if (upsellsToAdd.length > 0) {
            setSelectedServices([...selectedServices, ...upsellsToAdd]);
          }
        },
        {
          maxRetries: 2,
          onError: (error, retryCount) => {
            console.log(`Retry ${retryCount} after error:`, error);
          },
          onFinalError: (error) => {
            toast({
              title: language === 'ar' ? 'خطأ' : 'Error',
              description: language === 'ar' 
                ? 'فشلت محاولة تحديث الباقة. يرجى المحاولة مرة أخرى.'
                : 'Failed to update package. Please try again.',
              variant: "destructive"
            });
          }
        }
      );
      
      handlePackageBuilderClose();
    } catch (error) {
      console.error('Error confirming package:', error);
    } finally {
      setRetryingOperation(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep as BookingStep);

  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !customerDetails.name || !customerDetails.phone;
    return false;
  };

  const employeeWorkingHours = selectedEmployee?.working_hours ? transformWorkingHours(selectedEmployee.working_hours) : null;

  const shouldShowNavigation = currentStep === 'details';

  const shouldShowSummaryBar = selectedServices.length > 0 && currentStep !== 'details';

  const transformedServices = transformServicesForDisplay(selectedServices, language);

  return (
    <ErrorBoundary>
      <BookingProgress currentStep={currentStep as BookingStep} steps={STEPS} onStepClick={setCurrentStep} currentStepIndex={currentStepIndex} />

      <div className="mb-8">
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
            isUpdatingPackage={isUpdatingPackage || retryingOperation}
            handlePackageServiceUpdate={handlePackageServiceUpdate}
            onRemoveService={handleServiceRemove}
          />
        </ErrorBoundary>
      </div>

      {shouldShowNavigation && (
        <ErrorBoundary>
          <BookingNavigation 
            currentStepIndex={currentStepIndex} 
            steps={STEPS} 
            currentStep={currentStep as BookingStep} 
            setCurrentStep={setCurrentStep} 
            isNextDisabled={isNextDisabled()} 
            customerDetails={customerDetails} 
            branch={branch} 
          />
        </ErrorBoundary>
      )}

      {shouldShowSummaryBar && (
        <ErrorBoundary>
          <ServicesSummary 
            selectedServices={transformedServices} 
            totalDuration={totalDuration} 
            totalPrice={totalPrice} 
            language={language} 
            onNextStep={handleNextStep} 
            onPrevStep={handlePrevStep} 
            isFirstStep={currentStepIndex === 0} 
            packageEnabled={packageEnabled}
            packageSettings={packageSettings}
            availableServices={availablePackageServices}
            onAddService={(service) => handleServiceToggle(service)}
          />
        </ErrorBoundary>
      )}

      <BookingModals
        showUpsellModal={showUpsellModal}
        showPackageBuilder={showPackageBuilder}
        handleUpsellModalClose={handleUpsellModalClose}
        handleUpsellConfirm={handleUpsellConfirm}
        handlePackageBuilderClose={handlePackageBuilderClose}
        handlePackageBuilderConfirm={handlePackageBuilderConfirm}
        availableUpsells={availableUpsells || []}
        packageSettings={packageSettings}
        baseService={baseService}
        availablePackageServices={availablePackageServices}
        selectedServices={selectedServices}
      />
    </ErrorBoundary>
  );
};
