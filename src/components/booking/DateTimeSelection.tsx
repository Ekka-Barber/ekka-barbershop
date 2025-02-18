
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

const PREFETCH_DAYS = 3; // Number of future days to prefetch
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

const DateTimeSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { branch } = useBranchManagement();
  const { selectedBarber, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useBooking(branch);

  // Query for current day's time slots with correct TypeScript configuration
  const { data: timeSlots = [], isLoading, error } = useQuery({
    queryKey: ['timeSlots', selectedBarber?.id, selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedBarber || !selectedDate) return [];
      return useTimeSlots().getAvailableTimeSlots(selectedBarber, selectedDate);
    },
    enabled: !!selectedBarber && !!selectedDate,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2
  });

  // Prefetch multiple future days
  React.useEffect(() => {
    if (selectedBarber && selectedDate) {
      // Prefetch next PREFETCH_DAYS days
      for (let i = 1; i <= PREFETCH_DAYS; i++) {
        const futureDate = addDays(selectedDate, i);
        const queryKey = ['timeSlots', selectedBarber.id, futureDate.toISOString()];
        
        // Only prefetch if not already in cache
        if (!queryClient.getQueryData(queryKey)) {
          queryClient.prefetchQuery({
            queryKey,
            queryFn: async () => useTimeSlots().getAvailableTimeSlots(selectedBarber, futureDate),
            staleTime: STALE_TIME
          });
        }
      }
    }
  }, [selectedBarber, selectedDate, queryClient]);

  // Error handling in separate useEffect
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching time slots:', error);
      toast({
        title: t('Error'),
        description: t('Failed to load available time slots. Please try again.'),
        variant: "destructive"
      });
    }
  }, [error, toast, t]);

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
