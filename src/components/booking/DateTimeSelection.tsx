
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/hooks/useBooking';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { TimeSlotPicker } from './barber/TimeSlotPicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBranchManagement } from '@/hooks/booking/useBranchManagement';
import { addDays, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DateTimeSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { branch } = useBranchManagement();
  const { selectedBarber, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useBooking(branch);

  // Query for current day's time slots
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['timeSlots', selectedBarber?.id, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedBarber || !selectedDate) return [];
      return useTimeSlots().getAvailableTimeSlots(selectedBarber, selectedDate);
    },
    enabled: !!selectedBarber && !!selectedDate,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
    retry: 2,
    onError: (error) => {
      console.error('Error fetching time slots:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load available time slots. Please try again.'),
        variant: "destructive"
      });
    }
  });

  // Prefetch next day's slots
  React.useEffect(() => {
    if (selectedBarber && selectedDate) {
      const nextDay = addDays(selectedDate, 1);
      const queryKey = ['timeSlots', selectedBarber.id, nextDay.toISOString()];
      
      queryClient.prefetchQuery({
        queryKey,
        queryFn: async () => useTimeSlots().getAvailableTimeSlots(selectedBarber, nextDay),
        staleTime: 5 * 60 * 1000
      });
    }
  }, [selectedBarber, selectedDate, queryClient]);

  // Clear selected time when date changes
  React.useEffect(() => {
    setSelectedTime('');
  }, [selectedDate, setSelectedTime]);

  if (!selectedBarber) {
    navigate('/customer');
    return null;
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 text-center">
        <p className="text-red-500">
          {t('Failed to load time slots. Please try again.')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <TimeSlotPicker
        selectedBarber={selectedBarber}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        availableTimeSlots={timeSlots}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DateTimeSelection;
