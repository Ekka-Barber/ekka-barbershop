
import { useState } from "react";
import { PackageBuilderDialog } from "@/components/booking/package-builder/PackageBuilderDialog";
import { useBookingContext } from "@/contexts/BookingContext";
import { BookingStep } from "@/components/booking/BookingProgress";
import { useRetry } from "@/hooks/useRetry";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from "@/types/service";

interface PackageManagerProps {
  onStepChange: (step: BookingStep) => void;
}

export const PackageManager = ({ onStepChange }: PackageManagerProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { executeWithRetry } = useRetry();
  
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  const [retryingOperation, setRetryingOperation] = useState<boolean>(false);
  
  const {
    selectedServices,
    packageEnabled,
    packageSettings,
    hasBaseService,
    enabledPackageServices,
    baseService,
    handlePackageServiceUpdate
  } = useBookingContext();

  const availablePackageServices = packageSettings?.baseServiceId && enabledPackageServices 
    ? enabledPackageServices : [];
  
  const initiatePackageFlow = (nextStep: BookingStep) => {
    if (hasBaseService && packageSettings && availablePackageServices.length > 0) {
      setShowPackageBuilder(true);
      setPendingStep(nextStep);
      return true;
    }
    return false;
  };

  const handlePackageBuilderClose = () => {
    setShowPackageBuilder(false);
    if (pendingStep) {
      onStepChange(pendingStep);
      setPendingStep(null);
    }
  };

  const handlePackageBuilderConfirm = async (packageServices: SelectedService[]) => {
    try {
      setRetryingOperation(true);
      
      await executeWithRetry(
        async () => {
          const incomingBaseService = packageServices.find(s => 
            s.isBasePackageService || (baseService && s.id === baseService.id)
          );
          if (!incomingBaseService) {
            throw new Error('No base service found in package services');
          }
          
          if (handlePackageServiceUpdate) {
            handlePackageServiceUpdate(packageServices);
            handlePackageBuilderClose();
            return;
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
    } catch (error) {
      console.error('Error confirming package:', error);
    } finally {
      setRetryingOperation(false);
    }
  };

  return (
    <>
      <PackageBuilderDialog
        isOpen={showPackageBuilder}
        onClose={handlePackageBuilderClose}
        onConfirm={handlePackageBuilderConfirm}
        packageSettings={packageSettings}
        baseService={baseService}
        availableServices={availablePackageServices}
        currentlySelectedServices={selectedServices}
      />
    </>
  );
};
