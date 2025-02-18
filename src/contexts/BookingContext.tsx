
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { SelectedService } from '@/types/service';

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

const BookingContext = createContext<{
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
} | undefined>(undefined);

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  console.log('Booking state update:', { action, previousState: state });
  
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_SERVICES':
      return { ...state, selectedServices: action.payload };
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_BARBER':
      return { ...state, selectedBarber: action.payload };
    case 'SET_CUSTOMER_DETAILS':
      return { ...state, customerDetails: action.payload };
    case 'SET_BRANCH':
      return { ...state, branch: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

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
