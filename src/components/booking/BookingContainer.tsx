import { useState } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { ServicesStep } from "@/components/booking/steps/ServicesStep";
import { DateTimeStep } from "@/components/booking/steps/DateTimeStep";
import { BarberStep } from "@/components/booking/steps/BarberStep";
import { DetailsStep } from "@/components/booking/steps/DetailsStep";
import { BookingConfirmDialog } from "@/components/booking/BookingConfirmDialog";
import { useBooking } from "@/hooks/useBooking";
import { UpsellModal } from "@/components/booking/UpsellModal";

const steps = ['services', 'datetime', 'barber', 'details'];

function StepRenderer({ step, onNext, onPrevious, onConfirm }: {
  step: string;
  onNext: () => void;
  onPrevious: () => void;
  onConfirm: () => void;
}) {
  const { language } = useLanguage();
  const { bookingData } = useBooking();

  switch (step) {
    case 'services':
      return <ServicesStep onNext={onNext} />;
    case 'datetime':
      return <DateTimeStep onNext={onNext} onPrevious={onPrevious} />;
    case 'barber':
      return <BarberStep onNext={onNext} onPrevious={onPrevious} />;
    case 'details':
      return <DetailsStep onPrevious={onPrevious} onConfirm={onConfirm} />;
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
  const { clearBooking, confirmBooking } = useBooking();

  const currentStep = steps[currentStepIndex];
  const branchId = searchParams.get('branch');

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

  return (
    <>
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <BookingProgress currentStep={currentStep} />
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
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleBookingConfirm}
      />
      
      <UpsellModal 
        open={showUpsellModal} 
        onOpenChange={setShowUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        onConfirm={handleUpsellConfirm}
      />
    </>
  );
}
