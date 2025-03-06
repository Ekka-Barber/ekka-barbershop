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

  const handleServiceRemove = (serviceId: string) => {
    try {
      const serviceToRemove = selectedServices.find(s => s.id === serviceId);
      
      if (!serviceToRemove) {
        console.error('Service not found:', serviceId);
        return;
      }
      
      console.log('Removing service:', serviceId);
      
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
      
      const isPackageService = serviceToRemove.id === BASE_SERVICE_ID || 
                             serviceToRemove.isBasePackageService || 
                             serviceToRemove.isPackageAddOn;
      
      if (packageEnabled && isPackageService) {
        if (serviceToRemove.id === BASE_SERVICE_ID || serviceToRemove.isBasePackageService) {
          console.log('Removing base service - will disable package mode');
          setSelectedServices(selectedServices
            .filter(s => s.id !== serviceId)
            .map(s => {
              if (s.isPackageAddOn && s.originalPrice) {
                return {
                  ...s,
                  price: s.originalPrice,
                  isPackageAddOn: false,
                  discountPercentage: 0
                };
              }
              return s;
            }));
        } else {
          console.log('Removing package add-on service - will recalculate discounts');
          setTimeout(() => {
            const remainingServices = selectedServices.filter(s => s.id !== serviceId);
            const updatedServices = applyPackageDiscounts(remainingServices);
            if (updatedServices.length !== remainingServices.length) {
              console.error('Service count mismatch after discount recalculation');
            } else {
              setSelectedServices(updatedServices);
            }
          }, 50);
        }
      }
    } catch (error) {
      console.error('Error removing service:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar'
          ? 'حدث خطأ أثناء إزالة الخدمة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while removing the service. Please try again.',
        variant: "destructive"
      });
    }
  };

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    if (currentStep === 'services') {
      if (typedStep === 'datetime') {
        if (hasBaseService && packageSettings && availablePackageServices.length > 0) {
          setShowPackageBuilder(true);
          setPendingStep(typedStep);
          return;
        }
        if (availableUpsells?.length) {
          setShowUpsellModal(true);
          setPendingStep(typedStep);
          return;
        }
      }
    }
    setCurrentStep(typedStep);
  };

  const validateStep = (): boolean => {
    if (currentStep === 'services') {
      return selectedServices.length > 0;
    }
    if (currentStep === 'datetime') {
      if (!selectedDate) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار تاريخ' : 'Please select a date',
          description: language === 'ar' ? 'يجب عليك اختيار تاريخ للمتابعة' : 'You must select a date to continue',
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    if (currentStep === 'barber') {
      if (!selectedBarber) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار حلاق' : 'Please select a barber',
          description: language === 'ar' ? 'يجب عليك اختيار حلاق للمتابعة' : 'You must select a barber to continue',
          variant: "destructive"
        });
        return false;
      }
      if (!selectedTime) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار وقت' : 'Please select a time',
          description: language === 'ar' ? 'يجب عليك اختيار وقت للمتابعة' : 'You must select a time slot to continue',
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep as BookingStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep as BookingStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    } else {
      navigate('/customer');
    }
  };

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

      <UpsellModal isOpen={showUpsellModal} onClose={handleUpsellModalClose} onConfirm={handleUpsellConfirm} availableUpsells={availableUpsells || []} />
      
      <PackageBuilderDialog
        isOpen={showPackageBuilder}
        onClose={handlePackageBuilderClose}
        onConfirm={handlePackageBuilderConfirm}
        packageSettings={packageSettings}
        baseService={baseService}
        availableServices={availablePackageServices}
        currentlySelectedServices={selectedServices}
      />
    </ErrorBoundary>
  );
};
