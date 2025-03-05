
import { addDays } from "date-fns";
import { isAfterMidnight } from "./timeSlotUtils";

/**
 * Adjusts the selected date based on the time slot
 * For after-midnight slots (00:00-11:59), it adds one day to the date
 */
export const adjustDateForAfterMidnightSlot = (date: Date, timeSlot: string): Date => {
  if (!date || !timeSlot) {
    return date;
  }
  
  // If the time slot is after midnight (00:00-11:59), add one day to the date
  if (isAfterMidnight(timeSlot)) {
    console.log(`Adjusting date for after-midnight slot: ${timeSlot}`);
    return addDays(date, 1);
  }
  
  return date;
};

/**
 * Gets the display date for a booking based on the selected date and time
 * This ensures the summary shows the correct date for after-midnight slots
 */
export const getBookingDisplayDate = (selectedDate: Date | undefined, selectedTime: string | undefined): Date | undefined => {
  if (!selectedDate || !selectedTime) {
    return selectedDate;
  }
  
  return adjustDateForAfterMidnightSlot(selectedDate, selectedTime);
};
