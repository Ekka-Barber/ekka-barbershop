
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/hooks/useBooking';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { TimeSlotPicker } from './barber/TimeSlotPicker';
import { useQuery } from '@tanstack/react-query';

const DateTimeSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { branch, selectedBarber, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useBooking(branch);

  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ['timeSlots', selectedBarber?.id, selectedDate],
    queryFn: async () => {
      if (!selectedBarber || !selectedDate) return [];
      return useTimeSlots().getAvailableTimeSlots(selectedBarber, selectedDate);
    },
    enabled: !!selectedBarber && !!selectedDate
  });

  if (!selectedBarber) {
    navigate('/customer');
    return null;
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
