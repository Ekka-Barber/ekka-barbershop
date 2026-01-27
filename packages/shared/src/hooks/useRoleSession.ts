import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook for role-based session validation.
 * @param sessionCheck Async function that returns true if session is valid for the role.
 * @returns Status: 'checking' | 'granted' | 'denied'
 */
export const useRoleSession = (sessionCheck: () => Promise<boolean>) => {
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'granted' | 'denied'>('checking');

  useEffect(() => {
    let isActive = true;

    const verifySession = async () => {
      try {
        const hasSession = await sessionCheck();
        if (!isActive) return;
        setStatus(hasSession ? 'granted' : 'denied');
      } catch (_error) {
        if (!isActive) return;
        setStatus('denied');
      }
    };

    verifySession();

    return () => {
      isActive = false;
    };
  }, [sessionCheck, location.pathname]);

  return status;
};