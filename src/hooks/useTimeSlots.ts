
import { format, parse, isToday, isBefore, addHours, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

export const useTimeSlots = () => {
  const convertMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const generateTimeSlots = async (employeeId: string, selectedDate?: Date) => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    const dayOfWeek = selectedDate.getDay(); // 0-6, where 0 is Sunday

    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);

    if (error || !schedules.length) return slots;

    schedules.forEach(schedule => {
      if (!schedule.is_available) return;
      
      let currentMinutes = schedule.start_time;
      const endMinutes = schedule.end_time;

      // Handle cases where end time is on the next day
      const totalMinutes = schedule.crosses_midnight ? 
        endMinutes + (24 * 60) : 
        endMinutes;

      while (currentMinutes < totalMinutes) {
        const timeString = convertMinutesToTime(currentMinutes % (24 * 60));
        const [hours, minutes] = timeString.split(':').map(Number);
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hours, minutes, 0, 0);
        
        // Only add future slots for today
        if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
          slots.push({
            time: timeString,
            isAvailable: true
          });
        }
        currentMinutes += 30; // 30-minute intervals
      }
    });

    return slots.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getAvailableTimeSlots = async (employee: any, selectedDate: Date | undefined) => {
    if (!selectedDate || !employee?.id) return [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(employee.id, selectedDate);
  };

  const isEmployeeAvailable = async (employee: any, selectedDate: Date | undefined): Promise<boolean> => {
    if (!selectedDate || !employee?.id) return false;
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return false;
    }

    const dayOfWeek = selectedDate.getDay();
    
    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (error) return false;
    
    return schedules.length > 0;
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
