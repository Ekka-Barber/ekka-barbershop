
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "./DateRangeSelector";
import { UnifiedEvent } from "./types";

export interface TrackingPaginationParams {
  page: number;
  pageSize: number;
}

export const useTrackingData = (dateRange: DateRange, pagination?: TrackingPaginationParams) => {
  // Calculate previous period range
  const periodDuration = dateRange.to.getTime() - dateRange.from.getTime();
  const previousPeriodStart = new Date(dateRange.from.getTime() - periodDuration);
  const previousPeriodEnd = new Date(dateRange.from.getTime() - 1); // -1 to avoid overlap

  // Helper function to safely get range parameters
  const getRangeParams = (count: number | null, pagination?: TrackingPaginationParams) => {
    if (!pagination || !count) return undefined;
    
    const start = pagination.page * pagination.pageSize;
    // If start is beyond the total count, return last page
    if (start >= (count || 0)) {
      const lastPage = Math.floor((count - 1) / pagination.pageSize);
      return {
        start: lastPage * pagination.pageSize,
        end: count - 1
      };
    }
    return {
      start,
      end: Math.min(start + pagination.pageSize - 1, count - 1)
    };
  };

  const { data: interactionEvents, error: interactionsError, isLoading: interactionsLoading } = useQuery({
    queryKey: ['interaction-events', dateRange, pagination?.page],
    queryFn: async () => {
      try {
        // First get count
        const { count, error: countError } = await supabase
          .from('unified_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'interaction')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString());

        if (countError) throw countError;

        const range = getRangeParams(count, pagination);
        
        // Then get data with safe range
        const { data, error } = await supabase
          .from('unified_events')
          .select('*')
          .eq('event_type', 'interaction')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString())
          .order('timestamp', { ascending: false })
          ...(range ? `.range(${range.start}, ${range.end})` : '');
        
        if (error) throw error;
        return { data: data as UnifiedEvent[], totalCount: count || 0 };
      } catch (error) {
        console.error('Error fetching interaction events:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { data: previousPeriodData, error: previousPeriodError } = useQuery({
    queryKey: ['interaction-events-previous', dateRange],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('unified_events')
          .select('*')
          .eq('event_type', 'interaction')
          .gte('timestamp', previousPeriodStart.toISOString())
          .lte('timestamp', previousPeriodEnd.toISOString())
          .order('timestamp', { ascending: false });
        
        if (error) throw error;
        return data as UnifiedEvent[];
      } catch (error) {
        console.error('Error fetching previous period data:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { data: sessionData, error: sessionsError, isLoading: sessionsLoading } = useQuery({
    queryKey: ['unified-events-pageviews', dateRange, pagination?.page],
    queryFn: async () => {
      try {
        // First get count
        const { count, error: countError } = await supabase
          .from('unified_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'page_view')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString());

        if (countError) throw countError;

        const range = getRangeParams(count, pagination);
        
        // Then get data with safe range
        const { data, error } = await supabase
          .from('unified_events')
          .select('*')
          .eq('event_type', 'page_view')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString())
          .order('timestamp', { ascending: false })
          ...(range ? `.range(${range.start}, ${range.end})` : '');
        
        if (error) throw error;
        return { data: data as UnifiedEvent[], totalCount: count || 0 };
      } catch (error) {
        console.error('Error fetching session data:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const { data: bookingData, error: bookingsError, isLoading: bookingsLoading } = useQuery({
    queryKey: ['unified-events-bookings', dateRange, pagination?.page],
    queryFn: async () => {
      try {
        // First get count
        const { count, error: countError } = await supabase
          .from('unified_events')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'business')
          .eq('event_name', 'booking_completed')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString());

        if (countError) throw countError;

        const range = getRangeParams(count, pagination);
        
        // Then get data with safe range
        const { data, error } = await supabase
          .from('unified_events')
          .select('*')
          .eq('event_type', 'business')
          .eq('event_name', 'booking_completed')
          .gte('timestamp', dateRange.from.toISOString())
          .lte('timestamp', dateRange.to.toISOString())
          .order('timestamp', { ascending: false })
          ...(range ? `.range(${range.start}, ${range.end})` : '');
        
        if (error) throw error;
        return { data: data as UnifiedEvent[], totalCount: count || 0 };
      } catch (error) {
        console.error('Error fetching booking data:', error);
        throw error;
      }
    },
    retry: 1,
  });

  const error = interactionsError || sessionsError || bookingsError;
  const isLoading = interactionsLoading || sessionsLoading || bookingsLoading;

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

    const avgDuration = sessionsWithDuration.length > 0 
      ? sessionsWithDuration.reduce((acc, session) => {
          const entryTime = new Date(session.event_data.entry_time as string).getTime();
          const exitTime = new Date(session.event_data.exit_time as string).getTime();
          return acc + (exitTime - entryTime);
        }, 0) / (sessionsWithDuration.length * 1000)
      : 0;

    return {
      activeUsers: uniqueSessions,
      conversionRate: uniqueSessions ? (completedBookings / uniqueSessions) * 100 : 0,
      avgSessionDuration: avgDuration,
      totalInteractions: interactionEvents.data.length
    };
  };

  return {
    coreMetrics: calculateCoreMetrics(),
    isLoading,
    error,
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
