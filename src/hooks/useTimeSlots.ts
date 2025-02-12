
import { format, parse, isToday, isBefore, addHours } from "date-fns";
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

    console.log('Checking availability for slot:', {
      slotStart: slotMinutes,
      slotEnd: slotEndMinutes,
      unavailableSlots: unavailableSlots.map(slot => ({
        start: slot.start_time,
        end: slot.end_time,
      }))
    });
    
    // Check if the slot overlaps with any unavailable period
    for (const slot of unavailableSlots) {
      // Convert slot times to minutes if they're not already
      const slotStart = typeof slot.start_time === 'number' ? slot.start_time : convertTimeToMinutes(slot.start_time as unknown as string);
      const slotEnd = typeof slot.end_time === 'number' ? slot.end_time : convertTimeToMinutes(slot.end_time as unknown as string);

      // Check for any overlap
      const hasOverlap = (
        (slotMinutes >= slotStart && slotMinutes < slotEnd) || // Slot start overlaps
        (slotEndMinutes > slotStart && slotEndMinutes <= slotEnd) || // Slot end overlaps
        (slotMinutes <= slotStart && slotEndMinutes >= slotEnd) // Slot completely contains unavailable period
      );

      if (hasOverlap) {
        console.log('Found overlap:', {
          slotStart: slotMinutes,
          slotEnd: slotEndMinutes,
          unavailableStart: slotStart,
          unavailableEnd: slotEnd
        });
        return false;
      }
    }
    
    return true;
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string
  ): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    console.log('Generating time slots for:', {
      date: selectedDate,
      employeeId,
      ranges: workingHoursRanges
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

    console.log('Fetched unavailable slots:', unavailableSlots);

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = new Date(selectedDate);
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle cases where end time is after midnight
      if (end === "00:00" || end === "01:00") {
        endTime = addHours(endTime, 24);
      }
      
      let currentSlot = startTime;
      while (currentSlot < endTime) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        // Add detailed logging for slot generation
        console.log('Processing slot:', {
          timeString,
          slotMinutes,
          currentSlot: currentSlot.toISOString(),
          endTime: endTime.toISOString()
        });
        
        const available = isSlotAvailable(slotMinutes, unavailableSlots || []);
        
        console.log('Slot availability result:', {
          time: timeString,
          minutes: slotMinutes,
          available
        });

        slots.push({
          time: timeString,
          isAvailable: available
        });
        
        currentSlot = addHours(currentSlot, 0.5); // Add 30 minutes
      }
    }

    // Only apply the minimum booking time filter for today's slots
    if (isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addHours(now, 1);

      return slots
        .filter(slot => {
          const [hours, minutes] = slot.time.split(':').map(Number);
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hours, minutes, 0, 0);
          return !isBefore(slotTime, minimumBookingTime);
        })
        .sort((a, b) => a.time.localeCompare(b.time));
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableTimeSlots = async (employee: any, selectedDate: Date | undefined) => {
    if (!selectedDate || !employee?.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(workingHours, selectedDate, employee.id);
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
