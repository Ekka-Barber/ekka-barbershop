
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "./DateRangeSelector";
import { UnifiedEvent, TimePattern } from "./types";

export interface TrackingPaginationParams {
  page: number;
  pageSize: number;
}

export const useTrackingData = (dateRange: DateRange, pagination?: TrackingPaginationParams) => {
  // Calculate previous period range
  const periodDuration = dateRange.to.getTime() - dateRange.from.getTime();
  const previousPeriodStart = new Date(dateRange.from.getTime() - periodDuration);
  const previousPeriodEnd = new Date(dateRange.from.getTime() - 1); // -1 to avoid overlap

  const { data: interactionEvents, isLoading: interactionsLoading } = useQuery({
    queryKey: ['interaction-events', dateRange, pagination?.page],
    queryFn: async () => {
      let query = supabase
        .from('unified_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'interaction')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query.order('timestamp', { ascending: false });
      
      if (error) throw error;
      return { data: data as UnifiedEvent[], totalCount: count || 0 };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes before refetch
  });

  const { data: previousPeriodData } = useQuery({
    queryKey: ['interaction-events-previous', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unified_events')
        .select('*')
        .eq('event_type', 'interaction')
        .gte('timestamp', previousPeriodStart.toISOString())
        .lte('timestamp', previousPeriodEnd.toISOString())
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as UnifiedEvent[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: sessionData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['unified-events-pageviews', dateRange, pagination?.page],
    queryFn: async () => {
      let query = supabase
        .from('unified_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'page_view')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query.order('timestamp', { ascending: false });
      
      if (error) throw error;
      return { data: data as UnifiedEvent[], totalCount: count || 0 };
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: bookingData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['unified-events-bookings', dateRange, pagination?.page],
    queryFn: async () => {
      let query = supabase
        .from('unified_events')
        .select('*', { count: 'exact' })
        .eq('event_type', 'business')
        .eq('event_name', 'booking_completed')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query.order('timestamp', { ascending: false });
      
      if (error) throw error;
      return { data: data as UnifiedEvent[], totalCount: count || 0 };
    },
    staleTime: 1000 * 60 * 5,
  });

  const calculateCoreMetrics = () => {
    if (!sessionData?.data || !bookingData?.data || !interactionEvents?.data) {
      return {
        activeUsers: 0,
        conversionRate: 0,
        avgSessionDuration: 0,
        totalInteractions: 0
      };
    }

    const uniqueSessions = new Set(sessionData.data.map(s => s.session_id)).size;
    const completedBookings = bookingData.data.length;
    
    const sessionsWithDuration = sessionData.data.filter(s => 
      s.event_data && 
      typeof s.event_data === 'object' && 
      'exit_time' in s.event_data && 
      'entry_time' in s.event_data
    );

    const avgDuration = sessionsWithDuration.reduce((acc, session) => {
      const entryTime = new Date(session.event_data.entry_time as string).getTime();
      const exitTime = new Date(session.event_data.exit_time as string).getTime();
      return acc + (exitTime - entryTime);
    }, 0) / (sessionsWithDuration.length * 1000 || 1); // Avoid division by zero

    return {
      activeUsers: uniqueSessions,
      conversionRate: uniqueSessions ? (completedBookings / uniqueSessions) * 100 : 0,
      avgSessionDuration: avgDuration,
      totalInteractions: interactionEvents.data.length
    };
  };

  return {
    coreMetrics: calculateCoreMetrics(),
    isLoading: interactionsLoading || sessionsLoading || bookingsLoading,
    sessionData: sessionData?.data || [],
    bookingData: bookingData?.data || [],
    interactionEvents: interactionEvents?.data || [],
    previousPeriodData,
    totalCounts: {
      sessions: sessionData?.totalCount || 0,
      bookings: bookingData?.totalCount || 0,
      interactions: interactionEvents?.totalCount || 0
    }
  };
};
