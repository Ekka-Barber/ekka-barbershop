
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

    try {
      // Convert day of week from 0-6 to 1-7 where 1 is Sunday
      const dayOfWeek = selectedDate.getDay() + 1;
      console.log('Checking day of week:', dayOfWeek);

      // First check if it's an off day
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('off_days, working_hours')
        .eq('id', employeeId)
        .single();

      if (employeeError) {
        console.error('Error fetching employee data:', employeeError);
        return slots;
      }

      if (employeeData?.off_days) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        if (employeeData.off_days.includes(dateStr)) {
          console.log('Date is marked as off day:', dateStr);
          return slots;
        }
      }

      // Get all schedules for this employee and day
      const { data: schedules, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      console.log('Found schedules:', schedules);

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
        // Fallback to working_hours from employees table if employee_schedules fetch fails
        if (employeeData?.working_hours) {
          const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
          const daySchedules = employeeData.working_hours[dayName] || [];
          
          for (const timeRange of daySchedules) {
            const [start, end] = timeRange.split('-');
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);
            
            let currentMinutes = startHours * 60 + startMinutes;
            const endMinutes = endHours * 60 + endMinutes;
            
            while (currentMinutes < endMinutes) {
              const timeString = convertMinutesToTime(currentMinutes);
              const slotTime = new Date(selectedDate);
              slotTime.setHours(startHours, startMinutes, 0, 0);

              if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
                slots.push({
                  time: timeString,
                  isAvailable: true
                });
              }
              currentMinutes += 30;
            }
          }
          
          return slots.sort((a, b) => {
            const timeA = parse(a.time, 'HH:mm', new Date());
            const timeB = parse(b.time, 'HH:mm', new Date());
            return timeA.getTime() - timeB.getTime();
          });
        }
        return slots;
      }

      // If no schedules found, return empty array
      if (!schedules || schedules.length === 0) {
        console.log('No schedules found');
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
    } catch (error) {
      console.error('Error generating time slots:', error);
      return slots;
    }
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
    
    try {
      // First check if it's an off day
      if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
        console.log('Date is marked as off day');
        return false;
      }

      // Convert day of week from 0-6 to 1-7 where 1 is Sunday
      const dayOfWeek = selectedDate.getDay() + 1;
      console.log('Checking availability for day:', dayOfWeek);
      
      // Try to get schedules from employee_schedules first
      const { data: schedules, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (schedulesError) {
        console.error('Error checking schedules:', schedulesError);
        // Fallback to working_hours if employee_schedules fails
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('working_hours')
          .eq('id', employee.id)
          .single();

        if (employeeError) {
          console.error('Error checking employee working hours:', employeeError);
          return false;
        }

        if (employeeData?.working_hours) {
          const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
          const daySchedules = employeeData.working_hours[dayName] || [];
          return daySchedules.length > 0;
        }
        return false;
      }

      console.log('Available schedules found:', schedules);
      
      // Employee is available if they have at least one available schedule for this day
      const hasAvailableSchedule = schedules && schedules.length > 0;
      console.log('Has available schedule:', hasAvailableSchedule);
      
      return hasAvailableSchedule;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
