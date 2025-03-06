
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { PackageBuilderDialog } from "./package-builder/PackageBuilderDialog";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const {
    language
  } = useLanguage();
  const {
    toast
  } = useToast();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);

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
  } = useBooking(branch);

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

  // Find base service
  const baseService = selectedServices.find(s => s.id === BASE_SERVICE_ID) || 
    (categories?.flatMap(c => c.services).find(s => s.id === BASE_SERVICE_ID));

  // Get available package services
  const availablePackageServices = categories?.flatMap(c => c.services)
    .filter(service => 
      service.id !== BASE_SERVICE_ID && 
      enabledPackageServices?.includes(service.id)
    ) || [];

  // Handle service removal, with proper discount recalculation
  const handleServiceRemove = (serviceId: string) => {
    // Find the service to be removed
    const serviceToRemove = selectedServices.find(s => s.id === serviceId);
    
    if (!serviceToRemove) {
      console.error('Service not found:', serviceId);
      return;
    }
    
    console.log('Removing service:', serviceId);
    
    // Remove the service
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    
    // If removing a non-upsell service in package mode, recalculate discounts for remaining services
    const isPackageService = serviceToRemove.id === BASE_SERVICE_ID || 
                           serviceToRemove.isBasePackageService || 
                           serviceToRemove.isPackageAddOn;
    
    if (packageEnabled && isPackageService) {
      // If removing the base service, we need to handle it specially
      if (serviceToRemove.id === BASE_SERVICE_ID || serviceToRemove.isBasePackageService) {
        console.log('Removing base service - will disable package mode');
        
        // Remove discounts from all remaining services by resetting them to original prices
        setSelectedServices(prev => {
          const servicesWithoutDiscounts = prev
            .filter(s => s.id !== serviceId)
            .map(s => {
              if (s.isPackageAddOn && s.originalPrice) {
                // Reset to original price without discount
                return {
                  ...s,
                  price: s.originalPrice,
                  isPackageAddOn: false,
                  discountPercentage: 0
                };
              }
              return s;
            });
          
          return servicesWithoutDiscounts;
        });
      } else {
        // For non-base services, we just need to recalculate discounts
        console.log('Removing package add-on service - will recalculate discounts');
        setTimeout(() => {
          // Get updated services after the removal
          const remainingServices = selectedServices.filter(s => s.id !== serviceId);
          
          // Apply discounts based on new count
          const updatedServices = applyPackageDiscounts(remainingServices);
          
          // Update services with new discount levels
          if (updatedServices.length !== remainingServices.length) {
            console.error('Service count mismatch after discount recalculation');
          } else {
            setSelectedServices(updatedServices);
          }
        }, 50);
      }
    }
  };

  // Handle step change with package builder check
  const handleStepChange = (step: string) => {
    if (currentStep === 'services') {
      if (step === 'datetime') {
        // First check for package
        if (hasBaseService && packageSettings && availablePackageServices.length > 0) {
          setShowPackageBuilder(true);
          setPendingStep(step as BookingStep);
          return;
        }
        // Then check for upsells
        else if (availableUpsells?.length) {
          setShowUpsellModal(true);
          setPendingStep(step as BookingStep);
          return;
        }
      }
    }
    // If no package or upsells, or not in services step, proceed normally
    setCurrentStep(step as BookingStep);
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
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
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

  // Improved package builder handlers
  const handlePackageBuilderClose = () => {
    setShowPackageBuilder(false);
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  // Enhanced handlePackageBuilderConfirm to use the new update approach
  const handlePackageBuilderConfirm = (packageServices: any[]) => {
    // Verify that we have the base service
    const incomingBaseService = packageServices.find(s => s.isBasePackageService || s.id === BASE_SERVICE_ID);
    if (!incomingBaseService) {
      console.error('No base service found in package services');
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'خطأ في الباقة: لا توجد خدمة أساسية' : 'Package error: No base service found',
        variant: "destructive"
      });
      return;
    }
    
    // Use the new more efficient package update function
    if (handlePackageServiceUpdate) {
      console.log('Using optimized package update in BookingSteps');
      handlePackageServiceUpdate(packageServices);
      handlePackageBuilderClose();
      return;
    }
    
    // Legacy approach as fallback
    console.log('Using legacy package update in BookingSteps');
    
    // Preserve selected upsell items
    const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
    
    // Remove current non-upsell services
    const nonUpsellServices = selectedServices.filter(s => !s.isUpsellItem);
    for (const service of nonUpsellServices) {
      handleServiceToggle(service);
    }
    
    // Important: Small delay to ensure all removals are processed before adding
    setTimeout(() => {
      // Add the base service first (important for correct order)
      console.log('Adding base service first:', incomingBaseService.id);
      handleServiceToggle(incomingBaseService, true);
      
      // Add other package services
      const addOnServices = packageServices.filter(s => !s.isBasePackageService && s.id !== BASE_SERVICE_ID);
      for (const service of addOnServices) {
        console.log('Adding addon service:', service.id);
        handleServiceToggle(service, true);
      }
      
      // Restore any upsell items that were removed
      for (const upsell of existingUpsells) {
        if (!selectedServices.some(s => s.id === upsell.id)) {
          setSelectedServices(prev => [...prev, upsell]);
        }
      }
      
      // Close the dialog and proceed to the next step
      handlePackageBuilderClose();
    }, 100);
  };

  const currentStepIndex = STEPS.indexOf(currentStep);

  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !customerDetails.name || !customerDetails.phone;
    return false;
  };

  const employeeWorkingHours = selectedEmployee?.working_hours ? transformWorkingHours(selectedEmployee.working_hours) : null;

  const shouldShowNavigation = currentStep === 'details';

  // Modified to always show summary bar when services are selected, regardless of step
  const shouldShowSummaryBar = selectedServices.length > 0 && currentStep !== 'details';

  const transformedServices = transformServicesForDisplay(selectedServices, language);

  return <>
      <BookingProgress currentStep={currentStep} steps={STEPS} onStepClick={setCurrentStep} currentStepIndex={currentStepIndex} />

      <div className="mb-8">
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
          onRemoveService={handleServiceRemove}
        />
      </div>

      {shouldShowNavigation && <BookingNavigation currentStepIndex={currentStepIndex} steps={STEPS} currentStep={currentStep} setCurrentStep={setCurrentStep} isNextDisabled={isNextDisabled()} customerDetails={customerDetails} branch={branch} />}

      {shouldShowSummaryBar && <ServicesSummary 
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
      />}

      <UpsellModal isOpen={showUpsellModal} onClose={handleUpsellModalClose} onConfirm={handleUpsellConfirm} availableUpsells={availableUpsells || []} />
      
      {/* Updated PackageBuilderDialog with improved onConfirm handler */}
      <PackageBuilderDialog
        isOpen={showPackageBuilder}
        onClose={handlePackageBuilderClose}
        onConfirm={handlePackageBuilderConfirm}
        packageSettings={packageSettings}
        baseService={baseService}
        availableServices={availablePackageServices}
        currentlySelectedServices={selectedServices}
      />
    </>;
};
