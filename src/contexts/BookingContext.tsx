
import { createContext, useContext, ReactNode, useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { SelectedService } from '@/types/service';
import { CustomerDetails } from '@/types/booking';
import { BookingStep } from '@/components/booking/BookingProgress';

interface BookingContextType {
  // Step management
  currentStep: string;
  setCurrentStep: (step: any) => void;
  validateStep: () => boolean;
  
  // Service selection
  selectedServices: SelectedService[];
  setSelectedServices: (services: SelectedService[]) => void;
  handleServiceToggle: (service: any, isPackageOperation?: boolean) => void;
  handleServiceRemove: (serviceId: string) => void;
  handleUpsellServiceAdd: (services: any[]) => void;
  handlePackageServiceUpdate: (services: SelectedService[]) => void;
  isUpdatingPackage: boolean;
  
  // Date & time selection
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  selectedTime?: string;
  setSelectedTime: (time: string) => void;
  
  // Barber selection
  selectedBarber?: string;
  setSelectedBarber: (barberId: string) => void;
  selectedEmployee: any;
  
  // Customer details
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: string, value: string) => void;
  
  // Calculations
  totalPrice: number;
  totalDuration: number;
  
  // Data
  categories: any[] | undefined;
  categoriesLoading: boolean;
  employees: any[] | undefined;
  employeesLoading: boolean;
  
  // Package related
  packageEnabled?: boolean;
  packageSettings?: any;
  hasBaseService?: boolean;
  enabledPackageServices?: any[];
  baseService?: any;
  
  // Selected branch
  selectedBranch?: any;
  setSelectedBranch: (branch: any) => void;
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
