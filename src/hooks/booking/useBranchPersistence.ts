
import { Branch } from '@/types/branch';
import { useEffect } from 'react';
import { useBookingContext } from '@/contexts/BookingContext';

const BRANCH_STORAGE_KEY = 'selected_branch';
const STORAGE_VERSION = '1.0';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface StoredBranch {
  branch: Branch;
  timestamp: number;
  version: string;
}

export const useBranchPersistence = () => {
  const { dispatch } = useBookingContext();

  const storeBranch = (branch: Branch) => {
    try {
      const storedData: StoredBranch = {
        branch,
        timestamp: Date.now(),
        version: STORAGE_VERSION
      };
      localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(storedData));
    } catch (error) {
      console.error('Failed to store branch:', error);
    }
  };

  const loadStoredBranch = (): Branch | null => {
    try {
      const storedData = localStorage.getItem(BRANCH_STORAGE_KEY);
      if (!storedData) return null;

      const { branch, timestamp, version }: StoredBranch = JSON.parse(storedData);
      
      // Check if stored data is expired or version mismatch
      if (
        Date.now() - timestamp > STORAGE_EXPIRY ||
        version !== STORAGE_VERSION
      ) {
        localStorage.removeItem(BRANCH_STORAGE_KEY);
        return null;
      }

      return branch;
    } catch (error) {
      console.error('Failed to load stored branch:', error);
      return null;
    }
  };

  const clearStoredBranch = () => {
    localStorage.removeItem(BRANCH_STORAGE_KEY);
  };

  // Restore branch state on mount
  useEffect(() => {
    const storedBranch = loadStoredBranch();
    if (storedBranch) {
      dispatch({ type: 'SET_BRANCH', payload: storedBranch });
    }
  }, [dispatch]);

  return {
    storeBranch,
    loadStoredBranch,
    clearStoredBranch
  };
};
