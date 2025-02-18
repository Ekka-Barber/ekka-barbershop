
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ErrorRecoveryState {
  attempts: number;
  lastError: Error | null;
  recoveryStrategy: 'retry' | 'fallback' | 'reset';
  userNotified: boolean;
}

export const useBookingErrorRecovery = () => {
  const [recoveryState, setRecoveryState] = useState<ErrorRecoveryState>({
    attempts: 0,
    lastError: null,
    recoveryStrategy: 'retry',
    userNotified: false
  });

  const logError = async (
    bookingId: string,
    error: Error,
    details: any
  ) => {
    try {
      await supabase.from('booking_errors').insert({
        booking_id: bookingId,
        error_type: error.name,
        error_message: error.message,
        error_details: details
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  const handleError = useCallback(async (
    error: Error,
    bookingId: string,
    retryAction: () => Promise<void>
  ) => {
    setRecoveryState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      lastError: error
    }));

    // Log the error
    await logError(bookingId, error, {
      attempts: recoveryState.attempts + 1,
      timestamp: new Date().toISOString()
    });

    // Determine recovery strategy
    if (recoveryState.attempts < 3) {
      // Retry automatically
      try {
        await retryAction();
        setRecoveryState(prev => ({
          ...prev,
          attempts: 0,
          lastError: null
        }));
      } catch (retryError) {
        if (!recoveryState.userNotified) {
          toast.error('Having trouble completing your booking. We\'ll keep trying!');
          setRecoveryState(prev => ({
            ...prev,
            userNotified: true
          }));
        }
      }
    } else {
      // After 3 attempts, notify user and offer manual retry
      toast.error('Unable to complete the booking. Please try again or contact support.');
      setRecoveryState({
        attempts: 0,
        lastError: null,
        recoveryStrategy: 'reset',
        userNotified: false
      });
    }
  }, [recoveryState]);

  const resetRecoveryState = () => {
    setRecoveryState({
      attempts: 0,
      lastError: null,
      recoveryStrategy: 'retry',
      userNotified: false
    });
  };

  return {
    handleError,
    recoveryState,
    resetRecoveryState
  };
};
