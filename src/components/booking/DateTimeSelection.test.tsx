
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DateTimeSelection } from './DateTimeSelection';
import { useBooking } from '@/hooks/useBooking';
import { SelectedService } from '@/types/service';
import { CustomerDetails } from '@/types/booking';
import { BookingStep } from '@/components/booking/BookingProgress';
import { type Employee } from '@/types/employee';
import { Json } from '@/types/supabase-generated';

// Mock the useBooking hook
vi.mock('@/hooks/useBooking');

// Define mock props required by DateTimeSelection
const mockOnDateSelect = vi.fn();
const mockProps = {
  selectedDate: undefined, // Initial state for the test
  onDateSelect: mockOnDateSelect,
};

// Define a baseline mock context value (inferred type from useBooking)
const mockBookingContextValue = {
  currentStep: 'dateTime' as BookingStep,
  setCurrentStep: vi.fn(),
  selectedServices: [
    {
      id: '1',
      name_en: 'Haircut',
      name_ar: 'قص شعر',
      price: 30,
      duration: 30,
      category_id: 'cat1',
      display_order: 1,
      description_en: null,
      description_ar: null
    }
  ] as SelectedService[],
  setSelectedServices: vi.fn(),
  selectedDate: undefined,
  setSelectedDate: vi.fn(),
  selectedTime: undefined,
  setSelectedTime: vi.fn(),
  selectedBarber: 'barber1',
  setSelectedBarber: vi.fn(),
  customerDetails: { name: '', phone: '', email: '' } as CustomerDetails,
  handleCustomerDetailsChange: vi.fn(),
  totalPrice: 30,
  totalDuration: 30,
  handleServiceToggle: vi.fn(),
  handleUpsellServiceAdd: vi.fn(),
  categories: [],
  categoriesLoading: false,
  employees: [
    {
      id: 'barber1',
      name: 'John Doe',
      name_ar: 'جون دو',
      role: 'barber' as const,
      branch_id: 'branch1',
      // Add required properties for the test
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      previous_working_hours: {} as Json,
      salary_plan_id: '',
      working_hours: {} as Json,
      // Optional props with default values
      nationality: null,
      off_days: [],
      photo_url: null
    }
  ] as Employee[], // Use the updated Employee type
  employeesLoading: false,
  selectedEmployee: {
    id: 'barber1',
    name: 'John Doe',
    name_ar: 'جون دو',
    role: 'barber' as const,
    branch_id: 'branch1',
    // Add required properties for the test
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    previous_working_hours: {} as Json,
    salary_plan_id: '',
    working_hours: {} as Json,
    // Optional props with default values
    nationality: null,
    off_days: [],
    photo_url: null
  } as Employee, // Use the updated Employee type
  handlePackageServiceUpdate: vi.fn(),
  isUpdatingPackage: false,
  packageEnabled: false,
  packageSettings: {},
  hasBaseService: false,
  enabledPackageServices: [],
  baseService: null,
  validateStep: vi.fn(() => true),
  handleServiceRemove: vi.fn(),
  selectedBranch: { id: 'branch1', name: 'Main Branch' },
  setSelectedBranch: vi.fn(),
  availableSlots: { '2024-08-15': ['09:00', '10:00'] },
  isLoadingSlots: false,
  slotError: null,
  fetchAvailableSlots: vi.fn(),
  getTransformedServices: vi.fn(() => mockBookingContextValue.selectedServices),
};

describe('DateTimeSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBooking).mockReturnValue(mockBookingContextValue);
    mockProps.selectedDate = undefined;
    mockProps.onDateSelect = mockOnDateSelect;
  });

  it('renders without crashing', () => {
    render(<DateTimeSelection {...mockProps} />);
    expect(screen.getByRole('application', { name: 'Calendar' })).toBeInTheDocument();
  });

  // Add more tests here
}); 
