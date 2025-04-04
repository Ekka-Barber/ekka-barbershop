
import { WorkingHours } from '@/types/service';

export const isValidWorkingHours = (hours: any): boolean => {
  if (!hours || typeof hours !== 'object') return false;
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return daysOfWeek.every(day => {
    const dayHours = hours[day];
    
    // Skip if this day is not defined
    if (!dayHours) return true;
    
    // Check if it's an array of strings (the old format)
    if (Array.isArray(dayHours)) {
      return dayHours.every(slot => typeof slot === 'string');
    }
    
    // Check if it's an object with start/end properties (the new format)
    if (typeof dayHours === 'object') {
      return (
        'start' in dayHours &&
        'end' in dayHours &&
        typeof dayHours.start === 'string' &&
        typeof dayHours.end === 'string'
      );
    }
    
    return false;
  });
};

export const transformWorkingHours = (rawHours: any): WorkingHours | null => {
  try {
    if (isValidWorkingHours(rawHours)) {
      return rawHours as WorkingHours;
    }
    console.error('Invalid working hours format:', rawHours);
    return null;
  } catch (error) {
    console.error('Error transforming working hours:', error);
    return null;
  }
};
