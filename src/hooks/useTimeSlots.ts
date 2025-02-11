
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

    // Convert day of week from 0-6 to 1-7 where 1 is Sunday
    const dayOfWeek = selectedDate.getDay() + 1;
    console.log('Checking day of week:', dayOfWeek);

    // First check if it's an off day
    const { data: employeeData } = await supabase
      .from('employees')
      .select('off_days')
      .eq('id', employeeId)
      .single();

    if (employeeData?.off_days) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      if (employeeData.off_days.includes(dateStr)) {
        console.log('Date is marked as off day:', dateStr);
        return slots;
      }
    }

    // Get all schedules for this employee and day
    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    console.log('Found schedules:', schedules);

    // If no schedules found or error, all slots should be unavailable
    if (error || !schedules || schedules.length === 0) {
      console.log('No schedules found or error:', error);
      return slots;
    }

    // Process each schedule block
    for (const schedule of schedules) {
      let currentMinutes = schedule.start_time;
      let endMinutes = schedule.crosses_midnight ? 
        schedule.end_time + (24 * 60) : schedule.end_time;

      // Create 30-minute slots within this schedule block
      while (currentMinutes < endMinutes) {
        const normalizedMinutes = currentMinutes % (24 * 60);
        const timeString = convertMinutesToTime(normalizedMinutes);
        const slotTime = new Date(selectedDate);
        const [hours, mins] = timeString.split(':').map(Number);
        slotTime.setHours(hours, mins, 0, 0);

        // Only add future slots for today
        if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
          // Check if this slot already exists
          const existingSlot = slots.find(slot => slot.time === timeString);
          if (!existingSlot) {
            slots.push({
              time: timeString,
              isAvailable: true
            });
          }
        }

        currentMinutes += 30;
      }
    }

    // Sort slots by time
    return slots.sort((a, b) => {
      const timeA = parse(a.time, 'HH:mm', new Date());
      const timeB = parse(b.time, 'HH:mm', new Date());
      return timeA.getTime() - timeB.getTime();
    });
  };

  const getAvailableTimeSlots = async (employee: any, selectedDate: Date | undefined) => {
    if (!selectedDate || !employee?.id) return [];
    
    // First check if it's an off day
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      console.log('Date is in off_days:', format(selectedDate, 'yyyy-MM-dd'));
      return [];
    }

    const slots = await generateTimeSlots(employee.id, selectedDate);
    console.log('Generated time slots:', slots);
    return slots;
  };

  const isEmployeeAvailable = async (employee: any, selectedDate: Date | undefined): Promise<boolean> => {
    if (!selectedDate || !employee?.id) return false;
    
    // First check if it's an off day
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      console.log('Date is marked as off day');
      return false;
    }

    // Convert day of week from 0-6 to 1-7 where 1 is Sunday
    const dayOfWeek = selectedDate.getDay() + 1;
    console.log('Checking availability for day:', dayOfWeek);
    
    // Then check if there are any schedules for this day
    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    console.log('Available schedules found:', schedules);
    
    // Employee is available if they have at least one available schedule for this day
    // and it's not marked as an off day
    const hasAvailableSchedule = schedules && schedules.length > 0;
    console.log('Has available schedule:', hasAvailableSchedule);
    
    return hasAvailableSchedule;
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
