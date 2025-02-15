
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

  const isSlotAvailable = (slotMinutes: number, unavailableSlots: UnavailableSlot[], serviceDuration: number) => {
    const slotEndMinutes = slotMinutes + serviceDuration;
    
    console.log('Checking availability for slot:', {
      start: `${Math.floor(slotMinutes/60)}:${String(slotMinutes%60).padStart(2, '0')}`,
      end: `${Math.floor(slotEndMinutes/60)}:${String(slotEndMinutes%60).padStart(2, '0')}`,
      duration: serviceDuration,
      slotMinutes,
      slotEndMinutes
    });

    // Convert and normalize unavailable slots
    const normalizedUnavailableSlots = unavailableSlots.map(slot => {
      const start = typeof slot.start_time === 'number' ? slot.start_time : convertTimeToMinutes(slot.start_time as unknown as string);
      const end = typeof slot.end_time === 'number' ? slot.end_time : convertTimeToMinutes(slot.end_time as unknown as string);
      
      console.log('Checking against unavailable slot:', {
        start: `${Math.floor(start/60)}:${String(start%60).padStart(2, '0')}`,
        end: `${Math.floor(end/60)}:${String(end%60).padStart(2, '0')}`,
        startMinutes: start,
        endMinutes: end
      });
      
      return { start, end };
    });

    // Check if the service duration overlaps with any unavailable slot
    for (const slot of normalizedUnavailableSlots) {
      // Check if there's any overlap between the service time and unavailable slot
      const hasOverlap = (
        (slotMinutes >= slot.start && slotMinutes < slot.end) ||
        (slotEndMinutes > slot.start && slotEndMinutes <= slot.end) ||
        (slotMinutes <= slot.start && slotEndMinutes >= slot.end)
      );

      if (hasOverlap) {
        console.log('Found overlap:', {
          serviceStart: `${Math.floor(slotMinutes/60)}:${String(slotMinutes%60).padStart(2, '0')}`,
          serviceEnd: `${Math.floor(slotEndMinutes/60)}:${String(slotEndMinutes%60).padStart(2, '0')}`,
          unavailableStart: `${Math.floor(slot.start/60)}:${String(slot.start%60).padStart(2, '0')}`,
          unavailableEnd: `${Math.floor(slot.end/60)}:${String(slot.end%60).padStart(2, '0')}`,
          overlapConditions: {
            condition1: slotMinutes >= slot.start && slotMinutes < slot.end,
            condition2: slotEndMinutes > slot.start && slotEndMinutes <= slot.end,
            condition3: slotMinutes <= slot.start && slotEndMinutes >= slot.end
          }
        });
        return false;
      }
    }
    
    return true;
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30
  ): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    console.log('Generating time slots:', {
      date: selectedDate,
      employeeId,
      ranges: workingHoursRanges,
      serviceDuration
    });

    // Get all unavailable slots for the day
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { data: unavailableSlots, error } = await supabase
      .from('employee_schedules')
      .select('start_time, end_time')
      .eq('employee_id', employeeId)
      .eq('date', formattedDate)
      .eq('is_available', false);

    if (error) {
      console.error('Error fetching unavailable slots:', error);
      return slots;
    }

    console.log('Fetched unavailable slots:', unavailableSlots);

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = selectedDate;
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle times after midnight
      if (isAfter(startTime, endTime)) {
        endTime = addDays(endTime, 1);
      }

      console.log('Processing time range:', {
        start: format(startTime, 'HH:mm'),
        end: format(endTime, 'HH:mm'),
        crossesMidnight: isAfter(startTime, endTime)
      });
      
      let currentSlot = startTime;
      while (isBefore(currentSlot, endTime) || format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        // Check availability considering service duration
        const available = isSlotAvailable(slotMinutes, unavailableSlots || [], serviceDuration);
        
        // Check if service fits within working hours
        const slotEndMinutes = slotMinutes + serviceDuration;
        const endTimeMinutes = convertTimeToMinutes(format(endTime, 'HH:mm'));
        const fitsWithinWorkingHours = slotEndMinutes <= endTimeMinutes;
        
        slots.push({
          time: timeString,
          isAvailable: available && fitsWithinWorkingHours
        });
        
        if (format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) break;
        currentSlot = addMinutes(currentSlot, 30);
      }
    }

    // Apply minimum booking time filter for today's slots
    if (isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addMinutes(now, 30);

      return slots
        .filter(slot => {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hours, minutes, 0, 0);
          
          if (hours < 12 && hours >= 0) {
            slotTime.setDate(slotTime.getDate() + 1);
          }
          
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

  const getAvailableTimeSlots = async (
    employee: any, 
    selectedDate: Date | undefined,
    serviceDuration: number = 30
  ) => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(workingHours, selectedDate, employee.id, serviceDuration);
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
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
