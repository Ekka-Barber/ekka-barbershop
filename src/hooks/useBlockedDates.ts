
import { useState, useEffect, useCallback } from 'react';
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
      const { error } = await supabase
        .from('blocked_dates')
        .insert([{
          date: data.date.toISOString().split('T')[0],
          reason: data.reason,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.is_recurring ? 'yearly' : null
        }]);

      if (error) throw error;
      
      toast({
        title: "Date blocked",
        description: `${data.date.toLocaleDateString()} is now blocked for bookings`,
      });
      
      await fetchBlockedDates();
    } catch (error: any) {
      console.error('Error blocking date:', error);
      toast({
        title: "Error blocking date",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  }, [fetchBlockedDates, toast]);

  const unblockDate = useCallback(async (date: Date) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('date', date.toISOString().split('T')[0]);

      if (error) throw error;
      
      toast({
        title: "Date unblocked",
        description: `${date.toLocaleDateString()} is now available for bookings`,
      });
      
      await fetchBlockedDates();
    } catch (error: any) {
      console.error('Error unblocking date:', error);
      toast({
        title: "Error unblocking date",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    }
  }, [fetchBlockedDates, toast]);

  const isBlocked = useCallback((date: Date) => {
    return blockedDates.some(blockedDate => 
      isSameDay(new Date(blockedDate.date), date)
    );
  }, [blockedDates]);

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
