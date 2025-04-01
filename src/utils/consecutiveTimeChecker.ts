import { UnavailableSlot } from "./timeSlotTypes";
import { convertMinutesToTime } from "./timeConversion";

/**
 * Checks if there's enough consecutive time for a service
 */
export const hasEnoughConsecutiveTime = (
  slotStartMinutes: number,
  serviceDuration: number,
  unavailableSlots: UnavailableSlot[]
): boolean => {
  // Validate inputs
  if (!Array.isArray(unavailableSlots)) {
    return true; // Default to available if data is invalid
  }
  
  const slotEndMinutes = slotStartMinutes + serviceDuration;
  
  if (unavailableSlots.length === 0) {
    return true;
  }
  
  // Check if the service duration overlaps with any unavailable slots
  return !unavailableSlots.some(slot => {
    return (slotStartMinutes < slot.end_time && slotEndMinutes > slot.start_time);
  });
};
