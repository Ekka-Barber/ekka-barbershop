
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { isExcludedDomain } from "../utils/domainUtils";
import type { SummaryMetrics, TimelineDataPoint, TrafficSource } from "../types";

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

      const metrics = {
        visits: total_visits,
        uniqueVisitors: new Set(filteredData.map(v => v.browser_info?.['user_agent'])).size,
        conversions: total_conversions,
        conversionRate: overall_conversion_rate,
        revenue: 0, // To be implemented with actual revenue data
        costs: 0, // To be implemented with actual cost data
        roas: 0, // To be calculated when revenue and cost data are available
        cpl: 0, // To be calculated when cost data is available
        cac: 0, // To be calculated when cost data is available
        bounceRate: 0, // To be implemented with session duration data
        averageSessionDuration: 0, // To be implemented with session duration data
      };

      return {
        total_visits,
        total_conversions,
        overall_conversion_rate: overall_conversion_rate.toFixed(1),
        tiktok_visits: tiktok_total,
        tiktok_conversions,
        tiktok_conversion_rate: tiktok_conversion_rate.toFixed(1),
        tiktok_percentage: ((tiktok_total / total_visits) * 100).toFixed(1),
        metrics,
      } as SummaryMetrics;
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

      const dailyData: { [key: string]: TimelineDataPoint } = filteredData.reduce((acc, visit) => {
        const dateStr = visit.timestamp.split('T')[0];
        const isTikTok = visit.utm_source?.toLowerCase() === 'tiktok' || 
                        visit.referrer?.includes('tiktok.com');
        const deviceType = visit.device_type?.toLowerCase() || 'desktop';
        
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            visits: 0,
            tiktok_visits: 0,
            conversions: 0,
            deviceBreakdown: {
              mobile: 0,
              desktop: 0,
              tablet: 0
            }
          };
        }
        
        acc[dateStr].visits++;
        if (visit.converted_to_booking) {
          acc[dateStr].conversions++;
        }
        if (isTikTok) {
          acc[dateStr].tiktok_visits++;
        }
        if (deviceType in acc[dateStr].deviceBreakdown) {
          acc[dateStr].deviceBreakdown[deviceType as keyof typeof acc[dateStr]['deviceBreakdown']]++;
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

      const distribution: { [key: string]: number } = filteredData.reduce((acc, visit) => {
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
      }, {} as { [key: string]: number });

      const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);

      return Object.entries(distribution).map(([name, value]) => ({
        name,
        value,
        percent: (value / total) * 100,
        color: name.toLowerCase().includes('tiktok') ? '#FE2C55' : 
               COLORS[Object.keys(distribution).indexOf(name) % COLORS.length]
      })) as TrafficSource[];
    },
  });

  return {
    summaryData,
    isLoadingSummary,
    timelineData: timelineData || [],
    sourceData: sourceData || []
  };
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
