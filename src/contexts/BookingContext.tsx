
import { createContext, useContext, ReactNode } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { SelectedService } from '@/types/service';
import { CustomerDetails } from '@/types/booking';

interface BookingContextType {
  currentStep: string;
  setCurrentStep: (step: any) => void;
  selectedServices: SelectedService[];
  setSelectedServices: (services: SelectedService[]) => void;
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime?: string;
  setSelectedTime: (time: string) => void;
  selectedBarber?: string;
  setSelectedBarber: (barberId: string) => void;
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: string, value: string) => void;
  totalPrice: number;
  totalDuration: number;
  handleServiceToggle: (service: any) => void;
  handleUpsellServiceAdd: (services: any[]) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children, branch }: { children: ReactNode, branch: any }) {
  const bookingState = useBooking(branch);
  
  return (
    <BookingContext.Provider value={bookingState}>
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
