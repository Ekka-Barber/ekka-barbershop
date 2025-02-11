
import { format, parse, isToday, isBefore, addHours } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const isOffDay = (employee: any, date: Date): boolean => {
    if (!employee?.off_days) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return employee.off_days.includes(dateStr);
  };

  const generateTimeSlotsFromWorkingHours = (workingHours: any, selectedDate: Date) => {
    const slots: TimeSlot[] = [];
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
    const daySchedules = workingHours[dayName] || [];
    
    console.log('Generating slots for day:', dayName, 'schedules:', daySchedules);
    
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
    
    console.log('Generated slots:', slots);
    return slots;
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

    try {
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('working_hours')
        .eq('id', employee.id)
        .maybeSingle();

      if (employeeError) {
        console.error('Error fetching employee data:', employeeError);
        toast.error('Error loading employee schedule');
        return [];
      }

      if (!employeeData) {
        console.error('Employee not found');
        toast.error('Employee not found');
        return [];
      }

      if (employeeData.working_hours) {
        console.log('Using working_hours from employee data');
        const slots = generateTimeSlotsFromWorkingHours(employeeData.working_hours, selectedDate);
        return slots.sort((a, b) => {
          const timeA = parse(a.time, 'HH:mm', new Date());
          const timeB = parse(b.time, 'HH:mm', new Date());
          return timeA.getTime() - timeB.getTime();
        });
      }

      return [];
    } catch (error) {
      console.error('Error generating time slots:', error);
      toast.error('Error loading schedule data');
      return [];
    }
  };

  const isEmployeeAvailable = async (employee: any, selectedDate: Date | undefined): Promise<boolean> => {
    if (!selectedDate || !employee?.id) return false;
    
    try {
      if (isOffDay(employee, selectedDate)) {
        console.log('Date is marked as off day');
        return false;
      }

      if (employee.working_hours) {
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][selectedDate.getDay()];
        const daySchedules = employee.working_hours[dayName] || [];
        const hasSchedules = daySchedules.length > 0;
        console.log('Has available schedule from working_hours:', hasSchedules);
        return hasSchedules;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Error checking employee availability');
      return false;
    }
  };

  return {
    getAvailableTimeSlots,
    isEmployeeAvailable
  };
};
