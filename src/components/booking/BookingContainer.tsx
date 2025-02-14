
import { useState } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingConfirmDialog } from "@/components/booking/components/BookingConfirmDialog";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { useBooking } from "@/hooks/useBooking";
import type { BookingStep } from "@/types/booking";

function StepRenderer({ step, onNext, onPrevious, onConfirm }: {
  step: BookingStep;
  onNext: () => void;
  onPrevious: () => void;
  onConfirm: () => void;
}) {
  const { 
    selectedServices, 
    selectedDate,
    selectedTime,
    selectedBarber,
    categories,
    categoriesLoading,
    handleServiceToggle 
  } = useBooking();

  switch (step) {
    case 'services':
      return (
        <ServiceSelection 
          categories={categories}
          isLoading={categoriesLoading}
          selectedServices={selectedServices || []}
          onServiceToggle={handleServiceToggle}
          onStepChange={onNext}
        />
      );
    case 'datetime':
      return (
        <DateTimeSelection 
          selectedDate={selectedDate}
          onDateSelect={onNext}
          onBack={onPrevious}
        />
      );
    case 'barber':
      return (
        <BarberSelection 
          selectedBarber={selectedBarber}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );
    case 'details':
      return (
        <CustomerForm 
          onPrevious={onPrevious}
          onStepChange={onConfirm}
        />
      );
    default:
      return <div className="text-center">{language === 'ar' ? 'خطأ' : 'Error'}</div>;
  }
}

export function BookingContainer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const branchId = searchParams.get('branch');
  const { clearBooking, confirmBooking, selectedBranch, branchLoading } = useBooking({ branchId });

  const steps: BookingStep[] = ['services', 'datetime', 'barber', 'details'];
  const currentStep = steps[currentStepIndex];

  if (!branchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {language === 'ar' ? 'الرجاء اختيار فرع' : 'Please select a branch'}
      </div>
    );
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(true);
  };

  const handleBookingConfirm = async () => {
    setShowConfirmDialog(false);
    const success = await confirmBooking();
    if (success) {
      setShowUpsellModal(true);
    }
  };

  const handleUpsellConfirm = () => {
    setShowUpsellModal(false);
    clearBooking();
    navigate('/customer');
  };

  const handleStepClick = (step: BookingStep) => {
    const stepIndex = steps.indexOf(step);
    if (stepIndex <= currentStepIndex) {
      setCurrentStepIndex(stepIndex);
    }
  };

  return (
    <>
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <BookingHeader 
          branchName={selectedBranch?.name}
          branchAddress={selectedBranch?.address}
          isLoading={branchLoading}
        />
        <BookingProgress 
          currentStep={currentStep}
          steps={steps}
          onStepClick={handleStepClick}
          currentStepIndex={currentStepIndex}
        />
        <div className="space-y-6">
          <StepRenderer
            step={currentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onConfirm={handleConfirm}
          />
        </div>
      </div>

      <BookingConfirmDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleBookingConfirm}
        isLoading={false}
        language={language}
      />
      
      <UpsellModal 
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onConfirm={handleUpsellConfirm}
        availableUpsells={[]}
      />
    </>
  );
}
