import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays, set } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";
import { toast } from "sonner";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface UnavailableSlot {
  start_time: number;
  end_time: number;
}

interface TimeSlotValidation {
  isAvailable: boolean;
  conflictReason?: string;
  nextAvailableSlot?: string;
}

interface TimeSlotError {
  type: 'validation' | 'network' | 'system';
  message: string;
  recoverable: boolean;
}

export const useTimeSlots = () => {
  const convertTimeToMinutes = useMemo(() => {
    return (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
  }, []);

  const isSlotAvailable = useMemo(() => {
    return (slotMinutes: number, unavailableSlots: UnavailableSlot[]) => {
      const slotEndMinutes = slotMinutes + 30; // 30-minute slots
      
      return !unavailableSlots.some(slot => {
        const slotStart = typeof slot.start_time === 'number' 
          ? slot.start_time 
          : convertTimeToMinutes(slot.start_time as unknown as string);
        
        const slotEnd = typeof slot.end_time === 'number' 
          ? slot.end_time 
          : convertTimeToMinutes(slot.end_time as unknown as string);

        return (
          (slotMinutes >= slotStart && slotMinutes < slotEnd) || // Slot start overlaps
          (slotEndMinutes > slotStart && slotEndMinutes <= slotEnd) || // Slot end overlaps
          (slotMinutes <= slotStart && slotEndMinutes >= slotEnd) // Slot completely contains unavailable period
        );
      });
    };
  }, [convertTimeToMinutes]);

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string
  ): Promise<TimeSlot[]> => {
    if (!selectedDate || !employeeId) return [];

    try {
      const { data: cachedData } = await supabase
        .from('availability_cache')
        .select('time_slots')
        .eq('barber_id', employeeId)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .single();

      if (cachedData) {
        return cachedData.time_slots as TimeSlot[];
      }

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data: unavailableSlots, error } = await supabase
        .from('employee_schedules')
        .select('start_time, end_time')
        .eq('employee_id', employeeId)
        .eq('date', formattedDate)
        .eq('is_available', false);

      if (error) {
        console.error('Error fetching unavailable slots:', error);
        toast.error('Failed to load available time slots. Please try again.');
        return [];
      }

      const slots = workingHoursRanges.flatMap(range => {
        const [start, end] = range.split('-');
        const baseDate = selectedDate;
        const startTime = parse(start, 'HH:mm', baseDate);
        let endTime = parse(end, 'HH:mm', baseDate);
        
        if (isAfter(startTime, endTime)) {
          endTime = addDays(endTime, 1);
        }

        const timeSlots: TimeSlot[] = [];
        let currentSlot = startTime;

        while (isBefore(currentSlot, endTime) || format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) {
          const timeString = format(currentSlot, 'HH:mm');
          const slotMinutes = convertTimeToMinutes(timeString);
          
          timeSlots.push({
            time: timeString,
            isAvailable: isSlotAvailable(slotMinutes, unavailableSlots || [])
          });
          
          if (format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) break;
          currentSlot = addMinutes(currentSlot, 30);
        }

        return timeSlots;
      });

      await supabase
        .from('availability_cache')
        .upsert({
          barber_id: employeeId,
          date: formattedDate,
          time_slots: slots,
          last_updated: new Date().toISOString()
        });

      if (isToday(selectedDate)) {
        const now = new Date();
        const minimumBookingTime = addMinutes(now, 30);

        return slots
          .filter(slot => {
            const [hours, minutes] = slot.time.split(':').map(Number);
            const slotTime = set(selectedDate, { hours, minutes });
            return !isBefore(slotTime, minimumBookingTime);
          })
          .sort((a, b) => {
            const [aHours] = a.time.split(':').map(Number);
            const [bHours] = b.time.split(':').map(Number);
            const aValue = aHours < 12 ? aHours + 24 : aHours;
            const bValue = bHours < 12 ? bHours + 24 : bHours;
            return aValue - bValue;
          });
      }

      return slots.sort((a, b) => {
        const [aHours] = a.time.split(':').map(Number);
        const [bHours] = b.time.split(':').map(Number);
        const aValue = aHours < 12 ? aHours + 24 : aHours;
        const bValue = bHours < 12 ? bHours + 24 : bHours;
        return aValue - bValue;
      });
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast.error('Failed to load available time slots. Please try again.');
      return [];
    }
  };

  const validateTimeSlot = async (
    employeeId: string,
    date: Date,
    time: string
  ): Promise<TimeSlotValidation> => {
    try {
      const { data: conflicts } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', format(date, 'yyyy-MM-dd'))
        .eq('is_available', false);

      if (conflicts && conflicts.length > 0) {
        const nextSlot = await findNextAvailableSlot(employeeId, date);
        return {
          isAvailable: false,
          conflictReason: 'Barber is not available at this time',
          nextAvailableSlot: nextSlot
        };
      }

      return { isAvailable: true };
    } catch (error) {
      console.error('Error validating time slot:', error);
      throw new Error('Failed to validate time slot');
    }
  };

  const findNextAvailableSlot = async (
    employeeId: string,
    startDate: Date
  ): Promise<string | undefined> => {
    // Implementation for finding next available slot
    return undefined;
  };

  return {
    getAvailableTimeSlots: generateTimeSlots,
    validateTimeSlot,
    findNextAvailableSlot
  };
};
