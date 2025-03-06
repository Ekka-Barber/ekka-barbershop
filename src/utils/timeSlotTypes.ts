
/**
 * Represents a period of time when a resource is unavailable
 * @interface UnavailableSlot
 */
export interface UnavailableSlot {
  /**
   * Start time in minutes since midnight
   */
  start_time: number;
  
  /**
   * End time in minutes since midnight
   */
  end_time: number;
  
  /**
   * Optional reason for unavailability
   */
  reason?: string;
}

/**
 * Represents a bookable time slot
 * @interface TimeSlot
 */
export interface TimeSlot {
  /**
   * Time in HH:MM format
   */
  time: string;
  
  /**
   * Whether the time slot is available for booking
   */
  isAvailable: boolean;
  
  /**
   * Whether the time slot is on the next day (after midnight)
   */
  isAfterMidnight?: boolean;
  
  /**
   * Human-readable label for the time slot
   */
  label?: string;
}

/**
 * Represents grouped time slots by section (morning, afternoon, evening)
 * @interface GroupedTimeSlots
 */
export interface GroupedTimeSlots {
  /**
   * Morning time slots (06:00 - 12:00)
   */
  morning: TimeSlot[];
  
  /**
   * Afternoon time slots (12:00 - 18:00)
   */
  afternoon: TimeSlot[];
  
  /**
   * Evening time slots (18:00 - 23:59)
   */
  evening: TimeSlot[];
  
  /**
   * After midnight time slots (00:00 - 05:59)
   */
  afterMidnight: TimeSlot[];
}

/**
 * Normalizes the raw unavailable slot data from the database
 * into a standardized format for the application
 * 
 * @param slots - Raw unavailable slot data from the database
 * @returns Array of normalized UnavailableSlot objects
 */
export const normalizeUnavailableSlots = (slots: any[]): UnavailableSlot[] => {
  if (!slots || !Array.isArray(slots)) {
    return [];
  }
  
  return slots.map(slot => {
    // Ensure the start and end times are numbers
    const start_time = typeof slot.start_time === 'number' 
      ? slot.start_time 
      : parseInt(slot.start_time, 10);
      
    const end_time = typeof slot.end_time === 'number' 
      ? slot.end_time 
      : parseInt(slot.end_time, 10);
    
    return {
      start_time: isNaN(start_time) ? 0 : start_time,
      end_time: isNaN(end_time) ? 0 : end_time,
      reason: slot.reason
    };
  }).filter(slot => slot.start_time < slot.end_time); // Ensure valid slots only
};
