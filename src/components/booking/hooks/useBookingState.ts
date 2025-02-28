
import { useState } from 'react';
import { BookingStep } from '../BookingProgress';

export const useBookingState = () => {
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>("idle");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>("services");

  return {
    bookingStatus,
    setBookingStatus,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    currentStep,
    setCurrentStep
  };
};
