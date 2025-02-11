
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

    // Get all schedules for this employee and day
    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek);

    // If no schedules found or error, all slots should be unavailable
    if (error || !schedules || schedules.length === 0) {
      // Generate all time slots as unavailable
      for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
        slots.push({
          time: convertMinutesToTime(minutes),
          isAvailable: false
        });
      }
      return slots;
    }

    // Create a map of all minutes in the day to track availability
    const availabilityMap = new Array(24 * 60).fill(false);

    schedules.forEach(schedule => {
      if (schedule.is_available) {
        let currentMinutes = schedule.start_time;
        const endMinutes = schedule.crosses_midnight ? schedule.end_time + (24 * 60) : schedule.end_time;

        while (currentMinutes < endMinutes) {
          const normalizedMinutes = currentMinutes % (24 * 60);
          availabilityMap[normalizedMinutes] = true;
          currentMinutes += 1;
        }
      }
    });

    // Generate 30-minute slots based on the availability map
    for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
      const timeString = convertMinutesToTime(minutes);
      const [hours, mins] = timeString.split(':').map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, mins, 0, 0);

      // Check if all minutes in this 30-minute slot are available
      const isSlotAvailable = Array.from({ length: 30 }, (_, i) => availabilityMap[minutes + i]).every(Boolean);
      
      // Only add future slots for today
      if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
        slots.push({
          time: timeString,
          isAvailable: isSlotAvailable
        });
      }
    }

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
