
import { format, parse, isToday, isBefore, addMinutes, isAfter, addDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlot, UnavailableSlot, convertTimeToMinutes, sortTimeSlots } from "@/utils/timeSlotUtils";
import { isSlotAvailable, isEmployeeAvailable } from "@/utils/slotAvailability";

export const useTimeSlots = () => {
  /**
   * Generates time slots for a specific date and employee
   */
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

    return sortTimeSlots(slots);
  };

  /**
   * Gets available time slots for a specific employee and date
   */
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

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
