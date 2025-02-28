
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookingHeader } from "./BookingHeader";
import { BookingNavigation } from "./BookingNavigation";
import { BookingProgress, BookingStep } from "./BookingProgress";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { WhatsAppIntegration } from "./WhatsAppIntegration";
import { useBookingState } from "./hooks/useBookingState";
import { useBookingActions } from "./hooks/useBookingActions";
import { useBookingData } from "./hooks/useBookingData";
import { useBookingNavigation } from "./hooks/useBookingNavigation";
import { NoBranchMessage } from "./components/NoBranchMessage";
import { createBookingWithFeedback } from "./utils/bookingUtils";
import StepRenderer from "./steps/StepRenderer";
import { trackPageView } from "@/utils/clickTracking";
import { useLanguage } from "@/contexts/LanguageContext";

export const BookingContainer = () => {
  const { navigate, location, branchId } = useBookingNavigation();
  const { branch, branchLoading } = useBookingData(branchId);
  const { language } = useLanguage();
  const { 
    bookingStatus, 
    isConfirmDialogOpen, 
    setIsConfirmDialogOpen, 
    currentStep, 
    setCurrentStep 
  } = useBookingState();

  const {
    selectedServices,
    selectedDate,
    selectedTime,
    selectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    handleServiceToggle,
    totalPrice,
    canProceedToNextStep,
    createBooking,
    clearBookingData,
    setSelectedDate,
    setSelectedTime,
    setSelectedBarber,
    termsAccepted,
    setTermsAccepted
  } = useBookingActions(branch);

  // Track page view for analytics
  useEffect(() => {
    trackPageView({
      page: "booking",
      source: document.referrer,
      branch: branchId,
    });
  }, [branchId]);

  // Render no-branch message if no branch is selected
  if (!branchId) {
    return <NoBranchMessage navigate={navigate} />;
  }

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    await createBookingWithFeedback({
      createBooking,
      branchId,
      selectedBarber,
      clearBookingData,
      navigate,
      setBookingStatus: (status) => {},
      setIsConfirmDialogOpen
    });
  };

  return (
    <div className="container mx-auto py-4 px-4 mb-24">
      <BookingHeader 
        branchName={branch?.name}
        branchAddress={branch?.address}
        isLoading={branchLoading}
      />
      
      <BookingProgress currentStep={currentStep} />
      
      <div className="mt-6">
        <StepRenderer
          currentStep={currentStep}
          // Services step props
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedServices={selectedServices}
          onServiceToggle={handleServiceToggle}
          onStepChange={setCurrentStep}
          branchId={branchId}
          // DateTime step props
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          // Barber step props
          selectedBarber={selectedBarber}
          onBarberSelect={setSelectedBarber}
          employees={employees}
          employeesLoading={employeesLoading}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          // Customer step props
          customerDetails={customerDetails}
          onCustomerDetailsChange={handleCustomerDetailsChange}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          // Shared props
          branch={branch}
          totalPrice={totalPrice()}
          totalDuration={selectedServices.reduce((sum, service) => sum + service.duration, 0)}
        />
      </div>
      
      <BookingNavigation 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep}
        onConfirm={() => setIsConfirmDialogOpen(true)} 
        canProceed={canProceedToNextStep(currentStep)}
      />
      
      <BookingConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmBooking}
        isLoading={bookingStatus === "submitting"}
      />
      
      <WhatsAppIntegration 
        branch={branch} 
        selectedServices={selectedServices}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        customerDetails={customerDetails}
        totalPrice={totalPrice()}
        language={language}
      />
    </div>
  );
};
