
import { format, parse, isToday, isBefore, addHours } from "date-fns";

export const useTimeSlots = () => {
  const generateTimeSlots = (workingHoursRanges: string[] = [], selectedDate?: Date) => {
    const slots: string[] = [];
    
    if (!selectedDate) return slots;

    workingHoursRanges.forEach(range => {
      const [start, end] = range.split('-');
      
      // Use selectedDate as the base date for parsing times
      const baseDate = new Date(selectedDate);
      const startTime = parse(start, 'HH:mm', baseDate);
      let endTime = parse(end, 'HH:mm', baseDate);
      
      // Handle cases where end time is on the next day
      if (end === "00:00" || end === "01:00") {
        endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
      }
      
      let currentSlot = startTime;
      while (currentSlot < endTime) {
        slots.push(format(currentSlot, 'HH:mm'));
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
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

  const getAvailableTimeSlots = (employee: any, selectedDate: Date | undefined) => {
    if (!selectedDate || !employee.working_hours) return [];
    
    const dayName = format(selectedDate, 'EEEE').toLowerCase();
    const workingHours = employee.working_hours[dayName] || [];
    
    if (employee.off_days?.includes(format(selectedDate, 'yyyy-MM-dd'))) {
      return [];
    }
    
    return generateTimeSlots(workingHours, selectedDate);
  };

  const isEmployeeAvailable = (employee: any, selectedDate: Date | undefined): boolean => {
    if (!selectedDate || !employee.working_hours) return false;
    
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

