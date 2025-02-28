
import { useBooking } from "@/hooks/useBooking";
import { getCachedServices } from "@/utils/serviceCache";
import { useState, useEffect } from "react";

export const useBookingActions = (branch: any) => {
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
  } = useBooking(branch);

  // Load cached services on mount
  useEffect(() => {
    const cachedServices = getCachedServices();
    if (cachedServices && cachedServices.length > 0) {
      cachedServices.forEach(service => {
        handleServiceToggle(service);
      });
    }
  }, []);

  return {
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
  };
};
