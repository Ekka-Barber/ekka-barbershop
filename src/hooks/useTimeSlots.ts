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
    
    // Convert and normalize unavailable slots
    const normalizedUnavailableSlots = unavailableSlots.map(slot => ({
      start: typeof slot.start_time === 'number' ? slot.start_time : convertTimeToMinutes(slot.start_time as unknown as string),
      end: typeof slot.end_time === 'number' ? slot.end_time : convertTimeToMinutes(slot.end_time as unknown as string)
    }));

    // Check if the service duration overlaps with any unavailable slot
    for (const slot of normalizedUnavailableSlots) {
      const hasOverlap = (
        (slotMinutes >= slot.start && slotMinutes < slot.end) || // Start overlaps
        (slotEndMinutes > slot.start && slotEndMinutes <= slot.end) || // End overlaps
        (slotMinutes <= slot.start && slotEndMinutes >= slot.end) // Completely contains
      );

      if (hasOverlap) {
        return false;
      }
    }
    
    return true;
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string,
    serviceDuration: number = 30 // Default to 30 minutes if not specified
  ): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    console.log('Generating time slots for:', {
      date: selectedDate,
      employeeId,
      ranges: workingHoursRanges,
      serviceDuration
    });

    // Get all unavailable slots for the day in one query
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    console.log('Fetching unavailable slots for date:', formattedDate);
    
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

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = selectedDate;
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Properly handle times after midnight
      if (isAfter(startTime, endTime)) {
        // Add a day to the end time
        endTime = addDays(endTime, 1);
      }

      console.log('Processing time range:', {
        start: format(startTime, 'HH:mm'),
        end: format(endTime, 'HH:mm'),
        crossesMidnight: isAfter(startTime, endTime)
      });
      
      let currentSlot = startTime;
      // Use strict comparison to ensure we get all slots including the last one
      while (isBefore(currentSlot, endTime) || format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        console.log('Processing slot:', {
          timeString,
          slotMinutes,
          currentTime: format(currentSlot, 'HH:mm'),
          endTime: format(endTime, 'HH:mm')
        });
        
        // Check availability considering service duration
        const available = isSlotAvailable(slotMinutes, unavailableSlots || [], serviceDuration);
        
        // Only add the slot if there's enough time before closing
        const slotEndMinutes = slotMinutes + serviceDuration;
        const endTimeMinutes = convertTimeToMinutes(format(endTime, 'HH:mm'));
        const fitsWithinWorkingHours = slotEndMinutes <= endTimeMinutes;
        
        slots.push({
          time: timeString,
          isAvailable: available && fitsWithinWorkingHours
        });
        
        // Break the loop if we've reached the end time
        if (format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) break;
        
        currentSlot = addMinutes(currentSlot, 30);
      }
    }

    // Only apply the minimum booking time filter for today's slots
    if (isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addMinutes(now, 30);

      return slots
        .filter(slot => {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hours, minutes, 0, 0);
          
          // Handle slots after midnight
          if (hours < 12 && hours >= 0) {
            slotTime.setDate(slotTime.getDate() + 1);
          }
          
          return !isBefore(slotTime, minimumBookingTime);
        })
        .sort((a, b) => {
          const [aHours] = a.time.split(':').map(Number);
          const [bHours] = b.time.split(':').map(Number);
          
          // Custom sorting to handle after-midnight times
          const aValue = aHours < 12 ? aHours + 24 : aHours;
          const bValue = bHours < 12 ? bHours + 24 : bHours;
          
          return aValue - bValue;
        });
    }

    return slots.sort((a, b) => {
      const [aHours] = a.time.split(':').map(Number);
      const [bHours] = b.time.split(':').map(Number);
      
      // Custom sorting to handle after-midnight times
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
