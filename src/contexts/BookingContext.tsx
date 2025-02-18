
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { SelectedService } from '@/types/service';
import { toast } from "sonner";

interface BookingState {
  currentStep: BookingStep;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime: string;
  selectedBarber: Employee | null;
  customerDetails: CustomerDetails;
  branch: Branch | null;
}

type BookingAction =
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_SERVICES'; payload: SelectedService[] }
  | { type: 'SET_DATE'; payload: Date | undefined }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_BARBER'; payload: Employee | null }
  | { type: 'SET_CUSTOMER_DETAILS'; payload: CustomerDetails }
  | { type: 'SET_BRANCH'; payload: Branch | null }
  | { type: 'RESET' };

const STORAGE_KEY = 'booking_state';

const initialState: BookingState = {
  currentStep: 'services',
  selectedServices: [],
  selectedDate: undefined,
  selectedTime: '',
  selectedBarber: null,
  customerDetails: {
    name: '',
    phone: '',
    email: '',
    notes: ''
  },
  branch: null
};

function validateState(state: BookingState): boolean {
  if (!state.branch) return false;

  switch (state.currentStep) {
    case 'services':
      return state.selectedServices.length > 0;
    case 'datetime':
      return !!state.selectedDate && !!state.selectedTime;
    case 'barber':
      return !!state.selectedBarber;
    case 'details':
      return !!(state.customerDetails.name && state.customerDetails.phone);
    default:
      return false;
  }
}

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  console.log('Booking state update:', { action, previousState: state });

  let newState: BookingState;

  switch (action.type) {
    case 'SET_STEP':
      newState = { ...state, currentStep: action.payload };
      break;

    case 'SET_SERVICES':
      newState = { ...state, selectedServices: action.payload };
      break;

    case 'SET_DATE':
      newState = { ...state, selectedDate: action.payload };
      break;

    case 'SET_TIME':
      newState = { ...state, selectedTime: action.payload };
      break;

    case 'SET_BARBER':
      newState = { ...state, selectedBarber: action.payload };
      break;

    case 'SET_CUSTOMER_DETAILS':
      newState = { ...state, customerDetails: action.payload };
      break;

    case 'SET_BRANCH':
      newState = { ...state, branch: action.payload };
      break;

    case 'RESET':
      newState = initialState;
      break;

    default:
      return state;
  }

  // Validate state after updates
  if (!validateState(newState)) {
    console.warn('Invalid state detected:', newState);
    if (newState.currentStep !== 'services') {
      toast.error('Please complete all required fields before proceeding');
    }
  }

  // Persist state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.error('Failed to persist booking state:', error);
  }

  console.log('Booking state updated:', newState);
  return newState;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, undefined, () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Handle date conversion
        if (parsedState.selectedDate) {
          parsedState.selectedDate = new Date(parsedState.selectedDate);
        }
        return { ...initialState, ...parsedState };
      }
    } catch (error) {
      console.error('Failed to restore booking state:', error);
    }
    return initialState;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('BookingProvider unmounting, cleaning up...');
    };
  }, []);

  const contextValue = React.useMemo(() => ({
    state,
    dispatch,
    setCurrentStep: (step: BookingStep) => dispatch({ type: 'SET_STEP', payload: step }),
    setSelectedServices: (services: SelectedService[]) => dispatch({ type: 'SET_SERVICES', payload: services }),
    setSelectedDate: (date: Date | undefined) => dispatch({ type: 'SET_DATE', payload: date }),
    setSelectedTime: (time: string) => dispatch({ type: 'SET_TIME', payload: time }),
    setSelectedBarber: (barber: Employee | null) => dispatch({ type: 'SET_BARBER', payload: barber }),
    setCustomerDetails: (details: CustomerDetails) => dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: details }),
    setBranch: (branch: Branch | null) => dispatch({ type: 'SET_BRANCH', payload: branch }),
    reset: () => dispatch({ type: 'RESET' })
  }), [state, dispatch]);

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  setCurrentStep: (step: BookingStep) => void;
  setSelectedServices: (services: SelectedService[]) => void;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string) => void;
  setSelectedBarber: (barber: Employee | null) => void;
  setCustomerDetails: (details: CustomerDetails) => void;
  setBranch: (branch: Branch | null) => void;
  reset: () => void;
} | undefined>(undefined);

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
