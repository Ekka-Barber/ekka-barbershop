
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays } from "date-fns";
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

  const isSlotAvailable = (slotMinutes: number, unavailableSlots: UnavailableSlot[], serviceDuration: number, endTimeMinutes: number) => {
    const slotEndMinutes = slotMinutes + serviceDuration;
    
    // First check: Does the service fit within working hours?
    if (slotEndMinutes > endTimeMinutes) {
      console.log('Service does not fit within working hours:', {
        serviceStart: `${Math.floor(slotMinutes/60)}:${String(slotMinutes%60).padStart(2, '0')}`,
        serviceEnd: `${Math.floor(slotEndMinutes/60)}:${String(slotEndMinutes%60).padStart(2, '0')}`,
        workingHoursEnd: `${Math.floor(endTimeMinutes/60)}:${String(endTimeMinutes%60).padStart(2, '0')}`
      });
      return false;
    }

    // Convert and normalize unavailable slots
    const normalizedUnavailableSlots = unavailableSlots.map(slot => {
      const start = typeof slot.start_time === 'number' ? slot.start_time : convertTimeToMinutes(slot.start_time as unknown as string);
      const end = typeof slot.end_time === 'number' ? slot.end_time : convertTimeToMinutes(slot.end_time as unknown as string);
      return { start, end };
    });

    // Check for overlaps with unavailable slots
    for (const slot of normalizedUnavailableSlots) {
      const hasOverlap = (
        (slotMinutes >= slot.start && slotMinutes < slot.end) ||  // Service starts during unavailable slot
        (slotEndMinutes > slot.start && slotEndMinutes <= slot.end) ||  // Service ends during unavailable slot
        (slotMinutes <= slot.start && slotEndMinutes >= slot.end)  // Service spans entire unavailable slot
      );

      if (hasOverlap) {
        console.log('Found overlap with unavailable slot:', {
          serviceTime: `${Math.floor(slotMinutes/60)}:${String(slotMinutes%60).padStart(2, '0')} - ${Math.floor(slotEndMinutes/60)}:${String(slotEndMinutes%60).padStart(2, '0')}`,
          unavailableSlot: `${Math.floor(slot.start/60)}:${String(slot.start%60).padStart(2, '0')} - ${Math.floor(slot.end/60)}:${String(slot.end%60).padStart(2, '0')}`
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
    
    // Early return if no date, employee, or working hours
    if (!selectedDate || !employeeId || workingHoursRanges.length === 0) {
      console.log('No slots generated - missing required data:', {
        hasDate: !!selectedDate,
        hasEmployee: !!employeeId,
        workingHoursCount: workingHoursRanges.length
      });
      return slots;
    }

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

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = selectedDate;
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle times after midnight
      if (isAfter(startTime, endTime)) {
        endTime = addDays(endTime, 1);
      }

      const rangeEndMinutes = convertTimeToMinutes(format(endTime, 'HH:mm'));
      
      let currentSlot = startTime;
      while (isBefore(currentSlot, endTime) || format(currentSlot, 'HH:mm') === format(endTime, 'HH:mm')) {
        const timeString = format(currentSlot, 'HH:mm');
        const slotMinutes = convertTimeToMinutes(timeString);
        
        // Check availability considering service duration and working hours end time
        const available = isSlotAvailable(slotMinutes, unavailableSlots || [], serviceDuration, rangeEndMinutes);
        
        slots.push({
          time: timeString,
          isAvailable: available
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
    if (!selectedDate || !employee?.working_hours) {
      console.log('No employee or date provided');
      return [];
    }
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (workingHours.length === 0) {
      console.log('No working hours for:', {
        employee: employee.name,
        day: dayName,
        date: format(selectedDate, 'yyyy-MM-dd')
      });
      return [];
    }
    
    return generateTimeSlots(workingHours, selectedDate, employee.id, serviceDuration);
  };

  const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee?.working_hours) return false;
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    return workingHours.length > 0;
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
