
import { UnavailableSlot } from "./timeSlotTypes";
import { convertMinutesToTime } from "./timeConversion";

/**
 * Checks if there's enough consecutive time for a service
 * Enhanced with better logging and validation of unavailable slots
 */
export const hasEnoughConsecutiveTime = (
  slotStartMinutes: number,
  serviceDuration: number,
  unavailableSlots: UnavailableSlot[]
): boolean => {
  // Validate inputs
  if (!Array.isArray(unavailableSlots)) {
    console.error("Invalid unavailableSlots:", unavailableSlots);
    return true; // Default to available if data is invalid
  }
  
  // Log the service duration for debugging
  const slotEndMinutes = slotStartMinutes + serviceDuration;
  const timeStart = convertMinutesToTime(slotStartMinutes);
  const timeEnd = convertMinutesToTime(slotEndMinutes);
  
  console.log(`Checking consecutive time from ${timeStart} to ${timeEnd} (${slotStartMinutes}-${slotEndMinutes} mins)`);
  console.log(`Number of unavailable slots: ${unavailableSlots.length}`);
  
  if (unavailableSlots.length === 0) {
    console.log("No unavailable slots, time is available");
    return true;
  }
  
  // Debug: log all unavailable slots
  unavailableSlots.forEach((slot, index) => {
    const unavailStart = convertMinutesToTime(slot.start_time);
    const unavailEnd = convertMinutesToTime(slot.end_time);
    console.log(`Unavailable slot ${index+1}: ${unavailStart}-${unavailEnd} (${slot.start_time}-${slot.end_time} mins)`);
  });

  // Check if any unavailable slot overlaps with our required duration
  for (const slot of unavailableSlots) {
    // Ensure slot times are numbers
    const slotStart = typeof slot.start_time === 'number' 
      ? slot.start_time 
      : parseInt(String(slot.start_time));
    
    const slotEnd = typeof slot.end_time === 'number' 
      ? slot.end_time 
      : parseInt(String(slot.end_time));
    
    if (isNaN(slotStart) || isNaN(slotEnd)) {
      console.error("Invalid slot times:", slot);
      continue; // Skip invalid slots
    }

    // Handle slots that cross midnight
    const slotCrossesMidnight = slotEnd < slotStart;
    let overlap = false;
    
    if (slotCrossesMidnight) {
      // For slots that cross midnight, check two time periods
      overlap = (slotStartMinutes < slotEnd && slotEndMinutes > 0) || // Overlap in 00:00 to slotEnd period
               (slotStartMinutes < 1440 && slotEndMinutes > slotStart); // Overlap in slotStart to 23:59 period
    } else {
      // Standard overlap check for non-midnight-crossing slots
      // Check if ANY part of our slot is within the unavailable period
      overlap = (
        // Case 1: Slot starts during unavailable period
        (slotStartMinutes >= slotStart && slotStartMinutes < slotEnd) ||
        // Case 2: Slot ends during unavailable period
        (slotEndMinutes > slotStart && slotEndMinutes <= slotEnd) ||
        // Case 3: Slot completely contains unavailable period
        (slotStartMinutes <= slotStart && slotEndMinutes >= slotEnd)
      );
    }
    
    if (overlap) {
      const unavailStartTime = convertMinutesToTime(slotStart);
      const unavailEndTime = convertMinutesToTime(slotEnd);
      
      console.log(`OVERLAP DETECTED: Slot ${timeStart}-${timeEnd} overlaps with unavailable period ${unavailStartTime}-${unavailEndTime}`);
      console.log('Overlap details:', {
        requestedSlot: `${timeStart}-${timeEnd}`,
        serviceStart: slotStartMinutes,
        serviceEnd: slotEndMinutes,
        unavailableSlot: `${unavailStartTime}-${unavailEndTime}`,
        unavailableStart: slotStart,
        unavailableEnd: slotEnd,
        slotCrossesMidnight
      });
      return false;
    }
  }
  
  console.log(`No overlaps found. Slot ${timeStart}-${timeEnd} has enough consecutive time.`);
  return true;
};
