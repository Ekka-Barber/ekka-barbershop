
import { format, parse, isToday, isBefore, addHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export const useTimeSlots = () => {
  const convertTimeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const checkTimeSlotAvailability = async (
    employeeId: string,
    date: Date,
    startTime: string
  ): Promise<boolean> => {
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = startMinutes + 30; // 30-minute slots
    const formattedDate = format(date, 'yyyy-MM-dd');

    const { data, error } = await supabase.rpc('is_time_slot_available', {
      p_employee_id: employeeId,
      p_date: formattedDate,
      p_start_time: startMinutes,
      p_end_time: endMinutes
    });

    if (error) {
      console.error('Error checking time slot availability:', error);
      return true; // Default to available if there's an error
    }

    return data;
  };

  const generateTimeSlots = async (
    workingHoursRanges: string[] = [],
    selectedDate?: Date,
    employeeId?: string
  ): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    for (const range of workingHoursRanges) {
      const [start, end] = range.split('-');
      
      const baseDate = new Date(selectedDate);
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      if (end === "00:00" || end === "01:00") {
        endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
      }
      
      let currentSlot = startTime;
      while (currentSlot < endTime) {
        const timeString = format(currentSlot, 'HH:mm');
        const isAvailable = await checkTimeSlotAvailability(
          employeeId,
          selectedDate,
          timeString
        );
        
        slots.push({
          time: timeString,
          isAvailable
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
