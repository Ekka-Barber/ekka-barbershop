
import { useBookingContext } from '@/contexts/BookingContext';
import { Branch } from '@/types/booking';
import { useServiceManagement } from './booking/useServiceManagement';
import { useEmployeeManagement } from './booking/useEmployeeManagement';
import { useUpsellManagement } from './booking/useUpsellManagement';
import { useBookingNavigation } from './booking/useBookingNavigation';
import { useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';

export const useBooking = (branch: Branch) => {
  const { state, dispatch } = useBookingContext();
  
  const {
    categories,
    categoriesLoading,
    handleServiceToggle: baseHandleServiceToggle
  } = useServiceManagement();

  const {
    employees,
    employeesLoading,
    selectedEmployee,
    employeeWorkingHours
  } = useEmployeeManagement(branch);

  const { handleUpsellServiceAdd: baseHandleUpsellServiceAdd } = useUpsellManagement();

  const {
    handleBack,
    handleNext,
    canProceedToNext
  } = useBookingNavigation(
    state.currentStep,
    state.selectedServices,
    state.customerDetails,
    branch
  );

  const handleServiceToggle = useCallback((service: any, skipDiscountCalculation: boolean = false) => {
    dispatch({ type: 'LOCK_STEP_CHANGE' });
    try {
      baseHandleServiceToggle(
        service,
        state.selectedServices,
        (services) => dispatch({ type: 'SET_SERVICES', payload: services }),
        skipDiscountCalculation
      );
    } finally {
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    }
  }, [baseHandleServiceToggle, state.selectedServices, dispatch]);

  const handleUpsellServiceAdd = useCallback((upsellServices: any[]) => {
    dispatch({ type: 'LOCK_STEP_CHANGE' });
    try {
      baseHandleUpsellServiceAdd(
        upsellServices,
        state.selectedServices,
        (services) => dispatch({ type: 'SET_SERVICES', payload: services })
      );
    } finally {
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    }
  }, [baseHandleUpsellServiceAdd, state.selectedServices, dispatch]);

  const handleCustomerDetailsChange = useCallback((field: keyof typeof state.customerDetails, value: string) => {
    dispatch({
      type: 'SET_CUSTOMER_DETAILS',
      payload: { ...state.customerDetails, [field]: value }
    });
  }, [state.customerDetails, dispatch]);

  const handleStepChange = useCallback((nextStep: BookingStep) => {
    if (state.isStepChangeLocked) {
      console.log('Step change locked, skipping...', { nextStep });
      return;
    }

    dispatch({ type: 'LOCK_STEP_CHANGE' });
    try {
      if (canProceedToNext()) {
        console.log('Step change:', { from: state.currentStep, to: nextStep });
        dispatch({ type: 'SET_STEP', payload: nextStep });
      }
    } finally {
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    }
  }, [state.isStepChangeLocked, state.currentStep, dispatch, canProceedToNext]);

  const totalPrice = state.selectedServices.reduce((sum, service) => sum + service.price, 0);

  return {
    ...state,
    setCurrentStep: (step: BookingStep) => dispatch({ type: 'SET_STEP', payload: step }),
    setSelectedDate: (date: Date | undefined) => dispatch({ type: 'SET_DATE', payload: date }),
    setSelectedTime: (time: string) => dispatch({ type: 'SET_TIME', payload: time }),
    setSelectedBarber: (barber: any) => dispatch({ type: 'SET_BARBER', payload: barber }),
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    employeeWorkingHours,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handleCustomerDetailsChange,
    totalPrice,
    canProceedToNext,
    handleStepChange,
    handleBack,
    handleNext
  };
};
