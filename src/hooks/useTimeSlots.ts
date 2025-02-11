
import { format, parse, isToday, isBefore, addHours } from "date-fns";
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

  // Helper function to convert JavaScript's 0-6 to our database's 1-7 day format
  const convertToDatabaseDay = (jsDay: number): number => {
    return jsDay + 1; // Convert 0-6 to 1-7 where 1 is Sunday
  };

  const isOffDay = (employee: any, date: Date): boolean => {
    if (!employee?.off_days) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return employee.off_days.includes(dateStr);
  };

  const generateTimeSlots = async (employeeId: string, selectedDate?: Date) => {
    const slots: TimeSlot[] = [];
    
    if (!selectedDate || !employeeId) {
      console.log('Missing required parameters:', { selectedDate, employeeId });
      return slots;
    }

    try {
      const databaseDayOfWeek = convertToDatabaseDay(selectedDate.getDay());
      console.log('Database day of week:', databaseDayOfWeek);

      // Get employee data first
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('off_days, working_hours')
        .eq('id', employeeId)
        .single();

      if (employeeError) {
        console.error('Error fetching employee data:', employeeError);
        return slots;
      }

      // Check for off days first
      if (isOffDay(employeeData, selectedDate)) {
        console.log('Date is marked as off day');
        return slots;
      }

      // Try to get schedules from employee_schedules
      const { data: schedules, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('day_of_week', databaseDayOfWeek)
        .eq('is_available', true);

      if (!schedulesError && schedules && schedules.length > 0) {
        console.log('Using employee_schedules data:', schedules);
        
        // Process each schedule block
        for (const schedule of schedules) {
          let currentMinutes = schedule.start_time;
          const endMinutes = schedule.crosses_midnight ? 
            schedule.end_time + (24 * 60) : schedule.end_time;

          while (currentMinutes < endMinutes) {
            const normalizedMinutes = currentMinutes % (24 * 60);
            const timeString = convertMinutesToTime(normalizedMinutes);
            const slotTime = new Date(selectedDate);
            const [hours, mins] = timeString.split(':').map(Number);
            slotTime.setHours(hours, mins, 0, 0);

            if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
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
      } else {
        console.log('Falling back to working_hours:', schedulesError);
        // Fallback to working_hours from employees table
        if (employeeData?.working_hours) {
          const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
          const daySchedules = employeeData.working_hours[dayName] || [];
          
          for (const timeRange of daySchedules) {
            const [start, end] = timeRange.split('-');
            const [startHours, startMinutes] = start.split(':').map(Number);
            const [endHours, endMinutes] = end.split(':').map(Number);
            
            let currentMinutes = startHours * 60 + startMinutes;
            const endTotalMinutes = endHours * 60 + endMinutes;
            
            while (currentMinutes < endTotalMinutes) {
              const timeString = convertMinutesToTime(currentMinutes);
              const slotTime = new Date(selectedDate);
              const [hours, mins] = timeString.split(':').map(Number);
              slotTime.setHours(hours, mins, 0, 0);

              if (!isToday(selectedDate) || !isBefore(slotTime, addHours(new Date(), 1))) {
                slots.push({
                  time: timeString,
                  isAvailable: true
                });
              }
              currentMinutes += 30;
            }
          }
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
    if (!selectedDate || !employee?.id) {
      console.log('Missing required parameters:', { selectedDate, employeeId: employee?.id });
      return [];
    }
    
    if (isOffDay(employee, selectedDate)) {
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
      if (isOffDay(employee, selectedDate)) {
        console.log('Date is marked as off day');
        return false;
      }

      const databaseDayOfWeek = convertToDatabaseDay(selectedDate.getDay());
      console.log('Checking availability for day:', databaseDayOfWeek);
      
      // Try to get schedules from employee_schedules first
      const { data: schedules, error: schedulesError } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('day_of_week', databaseDayOfWeek)
        .eq('is_available', true);

      if (!schedulesError && schedules) {
        const hasAvailableSchedule = schedules.length > 0;
        console.log('Has available schedule from employee_schedules:', hasAvailableSchedule);
        return hasAvailableSchedule;
      }

      // Fallback to working_hours if employee_schedules fails
      console.log('Falling back to working_hours');
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
        const hasSchedules = daySchedules.length > 0;
        console.log('Has available schedule from working_hours:', hasSchedules);
        return hasSchedules;
      }
      
      return false;
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
