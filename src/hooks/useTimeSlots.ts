
import { format, parse, isToday, isBefore, addHours } from "date-fns";

export const useTimeSlots = () => {
  const generateTimeSlots = (workingHoursRanges: string[] = [], selectedDate?: Date) => {
    const slots: string[] = [];
    
    workingHoursRanges.forEach(range => {
      const [start, end] = range.split('-');
      const startTime = parse(start, 'HH:mm', new Date());
      let endTime = parse(end, 'HH:mm', new Date());
      
      if (end === "00:00" || end === "01:00") {
        endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
      }
      
      let currentSlot = startTime;
      while (currentSlot < endTime) {
        slots.push(format(currentSlot, 'HH:mm'));
        currentSlot = new Date(currentSlot.getTime() + 30 * 60000);
      }
    });

    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      const minimumBookingTime = addHours(now, 1);

      return slots
        .filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotTime = new Date();
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

