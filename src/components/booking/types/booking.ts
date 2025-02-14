
import { SelectedService } from "@/types/service";

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface Branch {
  whatsapp_number?: string | null;
  id?: string;
}

export interface BookingFormData {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: CustomerDetails;
  language: string;
  branch?: Branch;
}
