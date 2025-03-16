
import { createContext, useContext, ReactNode } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { SelectedService } from '@/types/service';
import { CustomerDetails } from '@/types/booking';
import { BookingStep } from '@/components/booking/BookingProgress';

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
  handleServiceToggle: (service: any, isPackageOperation?: boolean) => void;
  handleUpsellServiceAdd: (services: any[]) => void;
  
  // Additional properties needed by BookingSteps and BookingNavigation
  categories: any[] | undefined;
  categoriesLoading: boolean;
  employees: any[] | undefined;
  employeesLoading: boolean;
  selectedEmployee: any;
  handlePackageServiceUpdate: (services: SelectedService[]) => void;
  isUpdatingPackage: boolean;
  
  // New properties for the refactored components
  packageEnabled?: boolean;
  packageSettings?: any;
  hasBaseService?: boolean;
  enabledPackageServices?: any[];
  baseService?: any;
  validateStep?: () => boolean;
  handleServiceRemove?: (serviceId: string) => void;
  
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
