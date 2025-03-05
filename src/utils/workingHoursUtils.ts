
import { WorkingHours } from '@/types/service';

export const isValidWorkingHours = (hours: any): hours is WorkingHours => {
  if (!hours || typeof hours !== 'object') return false;
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Check if the structure matches the WorkingHours interface
  return daysOfWeek.some(day => {
    const dayHours = hours[day];
    return dayHours && 
      typeof dayHours === 'object' &&
      typeof dayHours.start === 'string' &&
      typeof dayHours.end === 'string';
  });
};

export const transformWorkingHours = (rawHours: any): WorkingHours | null => {
  try {
    if (isValidWorkingHours(rawHours)) {
      return rawHours;
    }
    
    // If rawHours is in the format of Record<string, string[]>, convert it to WorkingHours
    if (rawHours && typeof rawHours === 'object') {
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const transformedHours: WorkingHours = {};
      
      for (const day of daysOfWeek) {
        if (Array.isArray(rawHours[day]) && rawHours[day].length > 0) {
          // Take the first range and use it as the working hours for this day
          const timeRange = rawHours[day][0];
          
          if (typeof timeRange === 'string' && timeRange.includes('-')) {
            const [start, end] = timeRange.split('-');
            transformedHours[day] = { start, end };
          }
        }
      }
      
      // Check if we've added at least one day
      if (Object.keys(transformedHours).length > 0) {
        return transformedHours;
      }
    }
    
    console.error('Invalid working hours format:', rawHours);
    return null;
  } catch (error) {
    console.error('Error transforming working hours:', error);
    return null;
  }
};

// Helper function to format a working hours array for display
export const formatWorkingHoursForDisplay = (workingHours: any): string[] => {
  if (!workingHours) return ['N/A'];
  
  try {
    const result: string[] = [];
    
    // Handle array format (from the branches table)
    if (Array.isArray(workingHours)) {
      return workingHours.map(hours => hours);
    }
    
    // Handle object format with days
    if (typeof workingHours === 'object') {
      // Case 1: Format is { day: [time ranges] }
      const currentDay = new Date().toLocaleLowerCase().slice(0, 3);
      const daysMap: Record<string, string> = {
        'mon': 'monday',
        'tue': 'tuesday',
        'wed': 'wednesday',
        'thu': 'thursday',
        'fri': 'friday',
        'sat': 'saturday',
        'sun': 'sunday'
      };
      
      const day = daysMap[currentDay];
      
      if (Array.isArray(workingHours[day])) {
        return workingHours[day];
      }
      
      // Case 2: Format is { day: { start, end } }
      if (workingHours[day] && typeof workingHours[day] === 'object') {
        const { start, end } = workingHours[day];
        if (start && end) {
          return [`${start}-${end}`];
        }
      }
    }
    
    return result.length ? result : ['N/A'];
  } catch (error) {
    console.error('Error formatting working hours:', error);
    return ['N/A'];
  }
};
