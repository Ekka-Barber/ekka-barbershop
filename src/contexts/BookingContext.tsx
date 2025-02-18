
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
  isStepChangeLocked: boolean;
}

type BookingAction =
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_SERVICES'; payload: SelectedService[] }
  | { type: 'SET_DATE'; payload: Date | undefined }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_BARBER'; payload: Employee | null }
  | { type: 'SET_CUSTOMER_DETAILS'; payload: CustomerDetails }
  | { type: 'SET_BRANCH'; payload: Branch | null }
  | { type: 'LOCK_STEP_CHANGE' }
  | { type: 'UNLOCK_STEP_CHANGE' }
  | { type: 'RESET' };

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
  branch: null,
  isStepChangeLocked: false
};

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | undefined>(undefined);

const STORAGE_KEY = 'booking_state';

function validateState(state: BookingState): boolean {
  if (!state.branch) {
    console.error('No branch selected in state validation');
    return false;
  }

  switch (state.currentStep) {
    case 'services':
      return state.selectedServices.length > 0;
    case 'datetime':
      return !!state.selectedDate;
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
      if (state.isStepChangeLocked) {
        console.log('Step change locked, maintaining current step:', state.currentStep);
        return state;
      }
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
      
    case 'LOCK_STEP_CHANGE':
      newState = { ...state, isStepChangeLocked: true };
      break;
      
    case 'UNLOCK_STEP_CHANGE':
      newState = { ...state, isStepChangeLocked: false };
      break;
      
    case 'RESET':
      newState = initialState;
      break;
      
    default:
      return state;
  }

  // Persist state to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.error('Failed to persist booking state:', error);
  }

  return newState;
}

export function BookingProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available
  const [state, dispatch] = useReducer(bookingReducer, undefined, () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Convert date string back to Date object if it exists
        if (parsedState.selectedDate) {
          parsedState.selectedDate = new Date(parsedState.selectedDate);
        }
        return parsedState;
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
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    };
  }, []);

  // Monitor state changes
  useEffect(() => {
    console.log('Booking state updated:', state);
    
    // Validate state based on current step
    if (!validateState(state)) {
      console.warn('Invalid state detected:', state);
      toast.error('Please complete all required fields before proceeding');
    }
  }, [state]);

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
