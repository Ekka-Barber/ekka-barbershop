
import { Branch } from '@/types/branch';

export const useBranchValidation = () => {
  const validateBranchAvailability = (branch: Branch | null): { 
    isValid: boolean; 
    error?: string;
  } => {
    if (!branch) {
      return { isValid: false, error: 'No branch selected' };
    }

    return { isValid: true };
  };

  return {
    validateBranchAvailability
  };
};
