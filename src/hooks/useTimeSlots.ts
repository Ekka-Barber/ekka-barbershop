
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
    console.log('Checking day of week:', dayOfWeek);

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
      return slots; // Return empty array since no working hours
    }

    // Find the base working hours schedule (the one that defines the working day)
    const workingHoursSchedule = schedules[0];
    if (!workingHoursSchedule) return slots; // No working hours defined

    // Create a map of all minutes in the working hours to track availability
    const availabilityMap = new Array(24 * 60).fill(false);

    // First, mark the entire working period as available
    let currentMinutes = workingHoursSchedule.start_time;
    const endMinutes = workingHoursSchedule.crosses_midnight ? 
      workingHoursSchedule.end_time + (24 * 60) : 
      workingHoursSchedule.end_time;

    while (currentMinutes < endMinutes) {
      const normalizedMinutes = currentMinutes % (24 * 60);
      availabilityMap[normalizedMinutes] = true;
      currentMinutes += 1;
    }

    // Generate 30-minute slots but only within working hours
    const workingStart = workingHoursSchedule.start_time;
    const workingEnd = workingHoursSchedule.crosses_midnight ? 
      workingHoursSchedule.end_time + (24 * 60) : 
      workingHoursSchedule.end_time;

    for (let minutes = workingStart; minutes < workingEnd; minutes += 30) {
      const normalizedMinutes = minutes % (24 * 60);
      const timeString = convertMinutesToTime(normalizedMinutes);
      const slotTime = new Date(selectedDate);
      const [hours, mins] = timeString.split(':').map(Number);
      slotTime.setHours(hours, mins, 0, 0);

      // Check if all minutes in this 30-minute slot are available
      const isSlotAvailable = Array.from(
        { length: 30 }, 
        (_, i) => availabilityMap[(normalizedMinutes + i) % (24 * 60)]
      ).every(Boolean);
      
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
    
    // Check if it's an off day
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return false;
    }

    const dayOfWeek = selectedDate.getDay();
    console.log('Checking availability for day:', dayOfWeek);
    
    const { data: schedules, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    console.log('Available schedules found:', schedules);

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }
    
    // Employee is available if they have at least one available schedule for this day
    return schedules && schedules.length > 0;
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
