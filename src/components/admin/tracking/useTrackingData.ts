import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "./DateRangeSelector";

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
        .from('interaction_events')
        .select('*', { count: 'exact' })
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data, totalCount: count || 0 };
    },
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    staleTime: 1000 * 60 * 5, // 5 minutes before refetch
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
    },
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
  });

  const { data: sessionData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['page-views', dateRange, pagination?.page],
    queryFn: async () => {
      let query = supabase
        .from('page_views')
        .select('*', { count: 'exact' })
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data, totalCount: count || 0 };
    },
    gcTime: 1000 * 60 * 30,
    staleTime: 1000 * 60 * 5,
  });

  const { data: bookingData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', dateRange, pagination?.page],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (pagination) {
        const start = pagination.page * pagination.pageSize;
        const end = start + pagination.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data, totalCount: count || 0 };
    },
    gcTime: 1000 * 60 * 30,
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
    
    const sessionsWithDuration = sessionData.data.filter(s => s.exit_time);
    const avgDuration = sessionsWithDuration.reduce((acc, session) => {
      const duration = new Date(session.exit_time).getTime() - new Date(session.entry_time).getTime();
      return acc + duration;
    }, 0) / (sessionsWithDuration.length * 1000);

    return {
      activeUsers: uniqueSessions,
      conversionRate: (completedBookings / uniqueSessions) * 100,
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
