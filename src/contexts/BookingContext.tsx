
import { createContext, useContext, ReactNode, useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { SelectedService } from '@/types/service';
import { CustomerDetails } from '@/types/booking';
import { BookingStep } from '@/components/booking/BookingProgress';
import { BOOKING_STEPS, VALIDATION_MESSAGES } from '@/constants/bookingConstants';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface BookingContextType {
  // Step management
  currentStep: string;
  setCurrentStep: (step: any) => void;
  validateStep: () => boolean;
  bookingSteps: BookingStep[];
  
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
  validateCustomerDetails: () => boolean;
  
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
  const { toast } = useToast();
  const bookingState = useBooking(branch);
  
  // Add additional context methods
  const enhancedBookingState: BookingContextType = {
    ...bookingState,
    bookingSteps: BOOKING_STEPS,
    
    // Enhanced validation for customer details
    validateCustomerDetails: () => {
      const { customerDetails } = bookingState;
      const { email, phone, name } = customerDetails;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^05\d{8}$/;
      
      const isNameValid = name && name.trim() !== '';
      const isPhoneValid = phone && phoneRegex.test(phone);
      const isEmailValid = email && emailRegex.test(email);
      
      // Log validation details
      logger.debug('Customer details validation:', { 
        name: isNameValid, 
        phone: isPhoneValid, 
        email: isEmailValid 
      });
      
      return isNameValid && isPhoneValid && isEmailValid;
    }
  };
  
  return (
    <BookingContext.Provider value={enhancedBookingState}>
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
