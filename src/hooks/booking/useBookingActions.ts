
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { CustomerDetails } from './useBookingState';
import { SelectedService } from '@/types/service';
import { useQuery } from "@tanstack/react-query";

interface CreateBookingParams {
  branchId: string;
  employeeId?: string;
}

export const useBookingActions = (
  selectedServices: SelectedService[],
  selectedDate: Date | undefined,
  selectedTime: string | undefined,
  selectedBarber: string | undefined,
  customerDetails: CustomerDetails,
  setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>,
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | undefined>>,
  setSelectedTime: React.Dispatch<React.SetStateAction<string | undefined>>,
  setSelectedBarber: React.Dispatch<React.SetStateAction<string | undefined>>,
  setCustomerDetails: React.Dispatch<React.SetStateAction<CustomerDetails>>,
  termsAccepted?: boolean
) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  // Get the active terms version
  const { data: termsData } = useQuery({
    queryKey: ["active_terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("terms_and_conditions")
        .select("id, version")
        .eq("is_active", true)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching terms:', error);
        return null;
      }
      
      return data;
    },
  });

  const createBooking = async ({ branchId, employeeId }: CreateBookingParams) => {
    if (!selectedDate || !selectedTime) {
      throw new Error('Date and time are required');
    }

    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    // Calculate total duration in minutes for all services
    const totalDurationMinutes = calculateTotalDuration();

    // Format date for database (YYYY-MM-DD)
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const bookingData = {
      branch_id: branchId,
      barber_id: employeeId,
      customer_name: customerDetails.name,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
      customer_notes: customerDetails.notes,
      appointment_date: formattedDate,
      appointment_time: selectedTime,
      services: selectedServices.map(service => ({
        service_id: service.id,
        price: service.price,
        name: language === 'ar' ? service.name_ar : service.name_en
      })),
      total_price: totalPrice(),
      duration_minutes: totalDurationMinutes,
      status: 'pending',
      created_at: new Date().toISOString(),
      terms_accepted: termsAccepted || false,
      terms_version: termsData?.version
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data;
  };

  const clearBookingData = () => {
    setSelectedServices([]);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setSelectedBarber(undefined);
    setCustomerDetails({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const totalPrice = () => {
    return selectedServices.reduce((sum, service) => sum + service.price, 0);
  };

  const calculateTotalDuration = () => {
    return selectedServices.reduce((sum, service) => sum + service.duration, 0);
  };

  return {
    createBooking,
    clearBookingData,
    totalPrice,
    calculateTotalDuration
  };
};
