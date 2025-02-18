import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { SelectedService } from '@/types/service';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Transaction Types
interface StepTransaction {
  id: string;
  from: BookingStep;
  to: BookingStep;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

interface LockTransaction {
  id: string;
  componentId: string;
  timestamp: number;
  expiresAt: number;
}

interface BookingState {
  currentStep: BookingStep;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime: string;
  selectedBarber: Employee | null;
  customerDetails: CustomerDetails;
  branch: Branch | null;
  // Transaction Management
  activeLock: LockTransaction | null;
  pendingTransactions: StepTransaction[];
  transactionHistory: StepTransaction[];
}

type BookingAction =
  | { type: 'SET_STEP'; payload: { step: BookingStep; transactionId: string } }
  | { type: 'SET_SERVICES'; payload: SelectedService[] }
  | { type: 'SET_DATE'; payload: Date | undefined }
  | { type: 'SET_TIME'; payload: string }
  | { type: 'SET_BARBER'; payload: Employee | null }
  | { type: 'SET_CUSTOMER_DETAILS'; payload: CustomerDetails }
  | { type: 'SET_BRANCH'; payload: Branch | null }
  | { type: 'ACQUIRE_LOCK'; payload: { componentId: string; transactionId: string } }
  | { type: 'RELEASE_LOCK'; payload: { transactionId: string } }
  | { type: 'COMPLETE_TRANSACTION'; payload: { transactionId: string } }
  | { type: 'FAIL_TRANSACTION'; payload: { transactionId: string; error: string } }
  | { type: 'RESET' };

const STORAGE_KEY = 'booking_state';
const LOCK_TIMEOUT = 5000; // 5 seconds timeout for locks

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
  activeLock: null,
  pendingTransactions: [],
  transactionHistory: []
};

function validateState(state: BookingState): boolean {
  if (!state.branch) return true;

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

function getPersistableState(state: BookingState): Partial<BookingState> {
  const { activeLock, pendingTransactions, transactionHistory, ...persistableState } = state;
  return persistableState;
}

function isLockValid(lock: LockTransaction | null): boolean {
  if (!lock) return true;
  return Date.now() < lock.expiresAt;
}

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  console.log('Booking state update:', { action, previousState: state });

  let newState: BookingState = { ...state };

  // Handle lock-related actions first
  if (action.type === 'ACQUIRE_LOCK') {
    if (state.activeLock && isLockValid(state.activeLock)) {
      console.log('Lock acquisition failed - active lock exists:', state.activeLock);
      return state;
    }
    newState.activeLock = {
      id: action.payload.transactionId,
      componentId: action.payload.componentId,
      timestamp: Date.now(),
      expiresAt: Date.now() + LOCK_TIMEOUT
    };
    return newState;
  }

  if (action.type === 'RELEASE_LOCK') {
    if (state.activeLock?.id === action.payload.transactionId) {
      newState.activeLock = null;
    }
    return newState;
  }

  // For all other actions, verify lock status
  if (state.activeLock && isLockValid(state.activeLock)) {
    const isOwner = action.type === 'SET_STEP' && 
      state.pendingTransactions.some(t => t.id === action.payload.transactionId);
    if (!isOwner) {
      console.log('Action blocked - active lock exists:', state.activeLock);
      return state;
    }
  }

  switch (action.type) {
    case 'SET_STEP': {
      const transaction = state.pendingTransactions.find(t => t.id === action.payload.transactionId);
      if (!transaction) {
        console.error('No pending transaction found for step change');
        return state;
      }
      
      const completedTransaction: StepTransaction = {
        ...transaction,
        status: 'completed' as const,
        to: action.payload.step
      };
      
      newState = {
        ...state,
        currentStep: action.payload.step,
        pendingTransactions: state.pendingTransactions.filter(t => t.id !== action.payload.transactionId),
        transactionHistory: [...state.transactionHistory, completedTransaction]
      };
      break;
    }

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

    case 'COMPLETE_TRANSACTION': {
      const updatedTransactions = state.pendingTransactions.map(t =>
        t.id === action.payload.transactionId 
          ? { ...t, status: 'completed' as const } 
          : t
      );
      newState = {
        ...state,
        pendingTransactions: updatedTransactions.filter(t => t.status === 'pending'),
        transactionHistory: [...state.transactionHistory, ...updatedTransactions.filter(t => t.status === 'completed')]
      };
      break;
    }

    case 'FAIL_TRANSACTION': {
      const failedTransaction = state.pendingTransactions.find(t => t.id === action.payload.transactionId);
      if (failedTransaction) {
        const updatedTransaction: StepTransaction = {
          ...failedTransaction,
          status: 'failed' as const
        };
        newState = {
          ...state,
          pendingTransactions: state.pendingTransactions.filter(t => t.id !== action.payload.transactionId),
          transactionHistory: [...state.transactionHistory, updatedTransaction]
        };
        toast.error(`Transaction failed: ${action.payload.error}`);
      }
      break;
    }

    case 'RESET':
      newState = initialState;
      break;

    default:
      return state;
  }

  // Persist state (excluding transactional data)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistableState(newState)));
  } catch (error) {
    console.error('Failed to persist booking state:', error);
  }

  // Validate state after updates
  if (newState.branch && !validateState(newState)) {
    console.warn('Invalid state detected:', newState);
    toast.error('Please complete all required fields before proceeding');
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
        if (parsedState.selectedDate) {
          parsedState.selectedDate = new Date(parsedState.selectedDate);
        }
        return {
          ...initialState,
          ...parsedState,
          activeLock: null,
          pendingTransactions: [],
          transactionHistory: []
        };
      }
    } catch (error) {
      console.error('Failed to restore booking state:', error);
    }
    return initialState;
  });

  // Auto-cleanup mechanism for expired locks
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (state.activeLock && !isLockValid(state.activeLock)) {
        dispatch({ 
          type: 'RELEASE_LOCK', 
          payload: { transactionId: state.activeLock.id } 
        });
      }
    }, 1000);

    return () => clearInterval(cleanup);
  }, [state.activeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('BookingProvider unmounting, cleaning up...');
      if (state.activeLock) {
        dispatch({ 
          type: 'RELEASE_LOCK', 
          payload: { transactionId: state.activeLock.id } 
        });
      }
    };
  }, [state.activeLock]);

  const contextValue = React.useMemo(() => ({
    state,
    dispatch,
    initiateStepChange: (from: BookingStep, to: BookingStep, componentId: string) => {
      const transactionId = uuidv4();
      const transaction: StepTransaction = {
        id: transactionId,
        from,
        to,
        status: 'pending',
        timestamp: Date.now()
      };

      dispatch({
        type: 'ACQUIRE_LOCK',
        payload: { componentId, transactionId }
      });

      if (!state.activeLock) {
        dispatch({
          type: 'SET_STEP',
          payload: { step: to, transactionId }
        });
      }
    }
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
  initiateStepChange: (from: BookingStep, to: BookingStep, componentId: string) => void;
} | undefined>(undefined);

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}
