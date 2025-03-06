
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
  isNextDay?: boolean;
  
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
