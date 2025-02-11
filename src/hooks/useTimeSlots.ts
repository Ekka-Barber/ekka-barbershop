
import { format, parse, isToday, isBefore, addHours, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const useTimeSlots = () => {
  const convertMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const generateTimeSlots = async (employeeId: string, selectedDate?: Date) => {
    const slots: string[] = [];
    
    if (!selectedDate || !employeeId) return slots;

    const dayOfWeek = selectedDate.getDay(); // 0-6, where 0 is Sunday

    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (error || !schedules.length) return slots;

    schedules.forEach(schedule => {
      let currentMinutes = schedule.start_time;
      const endMinutes = schedule.end_time;

      // Handle cases where end time is on the next day
      const totalMinutes = schedule.crosses_midnight ? 
        endMinutes + (24 * 60) : 
        endMinutes;

      while (currentMinutes < totalMinutes) {
        slots.push(convertMinutesToTime(currentMinutes % (24 * 60)));
        currentMinutes += 30; // 30-minute intervals
      }
    });

    // Only apply the minimum booking time filter for today's slots
    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addHours(now, 1);

      return slots
        .filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hours, minutes, 0, 0);
          return !isBefore(slotTime, minimumBookingTime);
        })
        .sort();
    }

    return slots.sort();
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
