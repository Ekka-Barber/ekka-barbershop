
import { WorkingHours } from '@/types/service';

export const isValidWorkingHours = (hours: any): hours is WorkingHours => {
  if (!hours || typeof hours !== 'object') return false;
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return daysOfWeek.every(day => 
    !hours[day] || (Array.isArray(hours[day]) && hours[day].every((slot: any) => typeof slot === 'string'))
  );
};

export const transformWorkingHours = (rawHours: any): WorkingHours | null => {
  try {
    if (isValidWorkingHours(rawHours)) {
      return rawHours;
    }
    console.error('Invalid working hours format:', rawHours);
    return null;
  } catch (error) {
    console.error('Error transforming working hours:', error);
    return null;
  }
};

