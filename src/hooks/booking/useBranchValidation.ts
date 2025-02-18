
import { Branch, WorkingHours } from '@/types/branch';
import { format, parse } from 'date-fns';

export const useBranchValidation = () => {
  const isWithinWorkingHours = (branch: Branch, date: Date): boolean => {
    const dayOfWeek = format(date, 'EEEE').toLowerCase();
    const currentTime = format(date, 'HH:mm');
    
    const workingHours = branch.working_hours[dayOfWeek as keyof WorkingHours];
    
    if (!workingHours || workingHours.length === 0) {
      return false;
    }

    return workingHours.some(timeRange => {
      const [start, end] = timeRange.split('-');
      return currentTime >= start && currentTime <= end;
    });
  };

  const validateBranchAvailability = (branch: Branch | null): { 
    isValid: boolean; 
    error?: string;
  } => {
    if (!branch) {
      return { isValid: false, error: 'No branch selected' };
    }

    const now = new Date();
    if (!isWithinWorkingHours(branch, now)) {
      return { 
        isValid: false, 
        error: 'Branch is currently closed' 
      };
    }

    return { isValid: true };
  };

  return {
    isWithinWorkingHours,
    validateBranchAvailability
  };
};
