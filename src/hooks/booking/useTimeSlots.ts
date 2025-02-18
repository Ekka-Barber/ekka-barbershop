
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays, set } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface UnavailableSlot {
  start_time: number;
  end_time: number;
}

export const useTimeSlots = () => {
  const convertTimeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isSlotAvailable = (slotMinutes: number, unavailableSlots: UnavailableSlot[]) => {
    const slotEndMinutes = slotMinutes + 30; // 30-minute slots
    
    return !unavailableSlots.some(slot => {
      const slotStart = typeof slot.start_time === 'number' 
        ? slot.start_time 
        : convertTimeToMinutes(slot.start_time as unknown as string);
      
      const slotEnd = typeof slot.end_time === 'number' 
        ? slot.end_time 
        : convertTimeToMinutes(slot.end_time as unknown as string);

      return (
        (slotMinutes >= slotStart && slotMinutes < slotEnd) || 
        (slotEndMinutes > slotStart && slotEndMinutes <= slotEnd) || 
        (slotMinutes <= slotStart && slotEndMinutes >= slotEnd)
      );
    });
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string
  ): Promise<TimeSlot[]> => {
    if (!selectedDate || !employeeId) return [];

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    const { data: unavailableSlots, error } = await supabase
      .from('employee_schedules')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('date', formattedDate)
      .eq('is_available', false);

    if (error) {
      console.error('Error fetching unavailable slots:', error);
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
  };

  const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.working_hours) return false;
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return false;
    }
    
    return workingHours.length > 0;
  };

  return {
    getAvailableTimeSlots: async (employee: any, selectedDate: Date | undefined) => {
      if (!selectedDate || !employee?.working_hours) return [];
      
      const dayName = format(selectedDate, 'EEEE').toLowerCase();
      const workingHours = employee.working_hours[dayName] || [];
      
      if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
        return [];
      }
      
      return generateTimeSlots(workingHours, selectedDate, employee.id);
    },
    isEmployeeAvailable
  };
};
