
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { isExcludedDomain } from "../utils/domainUtils";

export const useAdsMetrics = (dateRange: DateRange) => {
  // Fetch campaign summary including TikTok data
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['campaign-summary', dateRange],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return null;

      const { data, error } = await supabase
        .from('campaign_visits')
        .select('*')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (error) throw error;

      // Filter out development/preview domains
      const filteredData = data.filter(visit => 
        !isExcludedDomain(visit.page_url) && 
        (!visit.referrer || !isExcludedDomain(visit.referrer))
      );

      // Calculate overall metrics
      const total_visits = filteredData.length;
      const total_conversions = filteredData.filter(visit => visit.converted_to_booking).length;
      const overall_conversion_rate = (total_conversions / total_visits) * 100 || 0;

      // Calculate TikTok-specific metrics
      const tiktok_visits = filteredData.filter(visit => 
        visit.utm_source?.toLowerCase() === 'tiktok' || 
        visit.referrer?.includes('tiktok.com')
      );
      const tiktok_total = tiktok_visits.length;
      const tiktok_conversions = tiktok_visits.filter(visit => visit.converted_to_booking).length;
      const tiktok_conversion_rate = (tiktok_conversions / tiktok_total) * 100 || 0;

      return {
        total_visits,
        total_conversions,
        overall_conversion_rate: overall_conversion_rate.toFixed(1),
        tiktok_visits: tiktok_total,
        tiktok_conversions,
        tiktok_conversion_rate: tiktok_conversion_rate.toFixed(1),
        tiktok_percentage: ((tiktok_total / total_visits) * 100).toFixed(1)
      };
    },
  });

  // Fetch campaign performance by day
  const { data: timelineData } = useQuery({
    queryKey: ['campaign-timeline', dateRange],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return [];

      const { data, error } = await supabase
        .from('campaign_visits')
        .select('*')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (error) throw error;

      const filteredData = data.filter(visit => 
        !isExcludedDomain(visit.page_url) && 
        (!visit.referrer || !isExcludedDomain(visit.referrer))
      );

      const dailyData = filteredData.reduce((acc: any, visit) => {
        const date = visit.timestamp.split('T')[0];
        const isTikTok = visit.utm_source?.toLowerCase() === 'tiktok' || 
                        visit.referrer?.includes('tiktok.com');
        
        if (!acc[date]) {
          acc[date] = { 
            date, 
            visits: 0, 
            conversions: 0,
            tiktok_visits: 0 
          };
        }
        acc[date].visits++;
        if (visit.converted_to_booking) {
          acc[date].conversions++;
        }
        if (isTikTok) {
          acc[date].tiktok_visits++;
        }
        return acc;
      }, {});

      return Object.values(dailyData);
    },
  });

  // Fetch traffic source distribution
  const { data: sourceData } = useQuery({
    queryKey: ['source-distribution', dateRange],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return [];

      const { data, error } = await supabase
        .from('campaign_visits')
        .select('utm_source, referrer, page_url')
        .gte('timestamp', dateRange.from.toISOString())
        .lte('timestamp', dateRange.to.toISOString());

      if (error) throw error;

      const filteredData = data.filter(visit => 
        !isExcludedDomain(visit.page_url) && 
        (!visit.referrer || !isExcludedDomain(visit.referrer))
      );

      const distribution = filteredData.reduce((acc: any, visit) => {
        let source = 'Direct';
        if (visit.utm_source) {
          source = visit.utm_source;
        } else if (visit.referrer?.includes('tiktok.com')) {
          source = 'TikTok';
        } else if (visit.referrer) {
          source = new URL(visit.referrer).hostname;
        }
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
      }));
    },
  });

  return {
    summaryData,
    isLoadingSummary,
    timelineData,
    sourceData
  };
};
