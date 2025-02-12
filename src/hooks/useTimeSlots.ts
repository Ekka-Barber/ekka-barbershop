
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

  const isSlotAvailable = (slotTime: string, unavailableSlots: UnavailableSlot[]) => {
    const slotMinutes = convertTimeToMinutes(slotTime);
    const slotEndMinutes = slotMinutes + 30; // 30-minute slots
    
    return !unavailableSlots.some(slot => 
      (slotMinutes <= slot.end_time && slotEndMinutes > slot.start_time)
    );
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string
  ): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    // Get all unavailable slots for the day in one query
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
      
      const baseDate = new Date(selectedDate);
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle cases where end time is after midnight
      if (end === "00:00" || end === "01:00") {
        endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
      }
      
      let currentSlot = startTime;
      while (currentSlot < endTime) {
        const timeString = format(currentSlot, 'HH:mm');
        const available = isSlotAvailable(timeString, unavailableSlots || []);
        
        slots.push({
          time: timeString,
          isAvailable: available
        });
        
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
      }
    }

    // Only apply the minimum booking time filter for today's slots
    if (selectedDate && isToday(selectedDate)) {
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
