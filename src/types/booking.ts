
import { SelectedService } from "./service";

export interface BookingDetails {
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarber?: Employee;
  totalPrice: number;
  totalDuration: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  date: string;
  start_time: number;
  end_time: number;
  is_available: boolean;
}

export interface Branch {
  id: string;
  name: string;
  name_ar: string | null;
  address: string;
  address_ar: string | null;
  working_hours: Record<string, string[]>;
  whatsapp_number?: string | null;
  google_maps_url?: string | null;
}

// Alias for backward compatibility
export type BarberDetails = Employee;

export interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: string;
  photo_url: string | null;
  nationality: string | null;
  working_hours: Record<string, string[]>;
  off_days: string[];
}

export interface BarberCardProps {
  id: string;
  name: string;
  name_ar: string | null;
  photo_url: string | null;
  nationality: string | null;
  isSelected: boolean;
  onSelect: () => void;
  date?: Date;
}

export interface TimeSlotPickerProps {
  selectedBarberData: Employee;
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  availableTimeSlots: TimeSlot[];
  isLoading: boolean;
}
