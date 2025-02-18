
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBooking } from '@/hooks/useBooking';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { format } from 'date-fns';
import TimeSlotPicker from './barber/TimeSlotPicker';

const DateTimeSelection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { selectedBarber, selectedDate, setSelectedDate, selectedTime, setSelectedTime } = useBooking();
  const { timeSlots, isLoading } = useTimeSlots(selectedBarber?.id, selectedDate);

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
