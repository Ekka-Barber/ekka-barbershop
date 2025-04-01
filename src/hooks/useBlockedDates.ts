import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlockedDate, BlockedDateInput } from '@/types/admin';
import { isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export const useBlockedDates = () => {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBlockedDates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setBlockedDates(data || []);
    } catch (error: any) {
      console.error('Error fetching blocked dates:', error);
      toast({
        title: "Error loading blocked dates",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const blockDate = useCallback(async (data: BlockedDateInput) => {
    try {
      // Format date consistently for blocking
      const formattedDate = data.date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{
          date: formattedDate,
          reason: data.reason,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.is_recurring ? 'yearly' : null
        }]);

      if (error) throw error;
      
      toast({
        title: "Date blocked",
        description: `${data.date.toLocaleDateString()} is now blocked for bookings`,
      });
      
      // No need to refetch - subscription will handle it
    } catch (error: any) {
      console.error('Error blocking date:', error);
      toast({
        title: "Error blocking date",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  }, [toast]);

  const unblockDate = useCallback(async (date: Date) => {
    try {
      // Format date consistently for unblocking
      const formattedDate = date.toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('date', formattedDate);

      if (error) throw error;
      
      toast({
        title: "Date unblocked",
        description: `${date.toLocaleDateString()} is now available for bookings`,
      });
      
      // No need to refetch - subscription will handle it
    } catch (error: any) {
      console.error('Error unblocking date:', error);
      toast({
        title: "Error unblocking date",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Memoize the isBlocked function to improve performance
  const isBlocked = useCallback((date: Date) => {
    // Early return for undefined date
    if (!date) return false;
    
    return blockedDates.some(blockedDate => 
      isSameDay(new Date(blockedDate.date), date)
    );
  }, [blockedDates]);

  // Set up realtime subscription once on mount
  useEffect(() => {
    fetchBlockedDates();
    
    // Set up real-time subscription for blocked dates changes
    const channel = supabase
      .channel('blocked-dates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocked_dates'
        },
        () => {
          // Only fetch when data changes
          fetchBlockedDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBlockedDates]);

  return {
    blockedDates,
    isLoading,
    blockDate,
    unblockDate,
    isBlocked,
    refreshBlockedDates: fetchBlockedDates
  };
};
