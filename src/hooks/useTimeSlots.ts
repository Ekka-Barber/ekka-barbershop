
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

  const hasEnoughConsecutiveTime = (
    slotStartMinutes: number,
    serviceDuration: number,
    unavailableSlots: UnavailableSlot[]
  ) => {
    const slotEndMinutes = slotStartMinutes + serviceDuration;

    // Check if any unavailable slot overlaps with our required duration
    for (const slot of unavailableSlots) {
      const slotStart = typeof slot.start_time === 'number' ? slot.start_time : convertTimeToMinutes(slot.start_time as unknown as string);
      const slotEnd = typeof slot.end_time === 'number' ? slot.end_time : convertTimeToMinutes(slot.end_time as unknown as string);

      // Check for any overlap
      if (
        (slotStartMinutes < slotEnd && slotEndMinutes > slotStart) || // Overlaps with unavailable period
        (slotStartMinutes === slotStart && slotEndMinutes === slotEnd) // Exactly matches unavailable period
      ) {
        console.log('Not enough consecutive time due to overlap:', {
          serviceStart: slotStartMinutes,
          serviceEnd: slotEndMinutes,
          unavailableStart: slotStart,
          unavailableEnd: slotEnd
        });
        return false;
      }
    }
    
    return true;
  };

  const isSlotAvailable = (
    slotMinutes: number,
    unavailableSlots: UnavailableSlot[],
    selectedDate: Date,
    serviceDuration: number = 30 // Default to 30 minutes if not specified
  ) => {
    // If it's today, check if the slot is within minimum booking time
    if (isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addMinutes(now, 15);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
      
      if (isBefore(slotTime, minimumBookingTime)) {
        console.log('Slot not available due to minimum booking time:', {
          slotTime: format(slotTime, 'HH:mm'),
          minimumBookingTime: format(minimumBookingTime, 'HH:mm')
        });
        return false;
      }
    }

    // Check if there's enough consecutive time for the service
    if (!hasEnoughConsecutiveTime(slotMinutes, serviceDuration, unavailableSlots)) {
      console.log('Slot not available due to insufficient consecutive time:', {
        startTime: slotMinutes,
        requiredDuration: serviceDuration
      });
      return false;
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

    const now = new Date();
    const minimumBookingTime = addMinutes(now, 15);

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = selectedDate;
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle shifts that cross midnight
      const crossesMidnight = isAfter(startTime, endTime);
      if (crossesMidnight) {
        endTime = addDays(endTime, 1);
      }

      console.log('Processing time range:', {
        start: format(startTime, 'HH:mm'),
        end: format(endTime, 'HH:mm'),
        crossesMidnight
      });
      
      let currentSlot = startTime;
      
      while (isBefore(currentSlot, endTime)) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        // Skip adding the 00:00 slot unless we're handling a shift that crosses midnight
        if (timeString === '00:00' && !crossesMidnight) {
          currentSlot = addMinutes(currentSlot, 30);
          continue;
        }

        // Skip slots that have already passed for today
        if (isToday(selectedDate)) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(Math.floor(slotMinutes / 60), slotMinutes % 60, 0, 0);
          
          if (isBefore(slotTime, minimumBookingTime)) {
            currentSlot = addMinutes(currentSlot, 30);
            continue;
          }
        }
        
        // Check availability considering service duration
        const available = isSlotAvailable(
          slotMinutes,
          unavailableSlots || [],
          selectedDate,
          serviceDuration
        );
        
        slots.push({
          time: timeString,
          isAvailable: available
        });
        
        currentSlot = addMinutes(currentSlot, 30);
      }
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
