
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "./DateRangeSelector";

export const useTrackingData = (dateRange: DateRange) => {
  // Calculate previous period range
  const periodDuration = dateRange.to.getTime() - dateRange.from.getTime();
  const previousPeriodStart = new Date(dateRange.from.getTime() - periodDuration);
  const previousPeriodEnd = new Date(dateRange.from.getTime() - 1); // -1 to avoid overlap

  const { data: interactionEvents, isLoading: interactionsLoading } = useQuery({
    queryKey: ['interaction-events', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interaction_events')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const { data: previousPeriodData } = useQuery({
    queryKey: ['interaction-events-previous', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interaction_events')
        .select('*')
        .gte('created_at', previousPeriodStart.toISOString())
        .lte('created_at', previousPeriodEnd.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const { data: sessionData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['page-views', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_views')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const { data: bookingData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      
      if (error) throw error;
      return data;
    }
  });

  const calculateCoreMetrics = () => {
    if (!sessionData || !bookingData || !interactionEvents) {
      return {
        activeUsers: 0,
        conversionRate: 0,
        avgSessionDuration: 0,
        totalInteractions: 0
      };
    }

    const uniqueSessions = new Set(sessionData.map(s => s.session_id)).size;
    const completedBookings = bookingData.length;
    
    const sessionsWithDuration = sessionData.filter(s => s.exit_time);
    const avgDuration = sessionsWithDuration.reduce((acc, session) => {
      const duration = new Date(session.exit_time).getTime() - new Date(session.entry_time).getTime();
      return acc + duration;
    }, 0) / (sessionsWithDuration.length * 1000);

    return {
      activeUsers: uniqueSessions,
      conversionRate: (completedBookings / uniqueSessions) * 100,
      avgSessionDuration: avgDuration,
      totalInteractions: interactionEvents.length
    };
  };

  return {
    coreMetrics: calculateCoreMetrics(),
    isLoading: interactionsLoading || sessionsLoading || bookingsLoading,
    sessionData,
    bookingData,
    interactionEvents,
    previousPeriodData
  };
};
