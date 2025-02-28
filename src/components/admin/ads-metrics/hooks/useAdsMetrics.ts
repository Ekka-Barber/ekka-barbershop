
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { isExcludedDomain } from "../utils/domainUtils";
import type { SummaryMetrics, TimelineDataPoint, TrafficSource, DeviceMetrics, AggregatedMetrics } from "../types";
import { fetchCampaignCostsByDateRange } from "../services/campaignCostService";

export const useAdsMetrics = (dateRange: DateRange) => {
  // Check if date range is valid
  const isValidRange = dateRange.from && dateRange.to;

  // Fetch data from materialized view for better performance
  const { data: aggregatedData, isLoading: isLoadingAggregated } = useQuery({
    queryKey: ['campaign-metrics-daily', dateRange],
    queryFn: async () => {
      if (!isValidRange) return [];

      // Call RPC to refresh view first
      await supabase.rpc('refresh_campaign_metrics');
      
      // Then get data
      const { data, error } = await supabase
        .from('campaign_metrics_daily')
        .select('*')
        .gte('day', dateRange.from!.toISOString())
        .lte('day', dateRange.to!.toISOString());

      if (error) throw error;
      return data as AggregatedMetrics[];
    },
    enabled: isValidRange,
  });

  // Fetch campaign costs for the date range
  const { data: costData, isLoading: isLoadingCosts } = useQuery({
    queryKey: ['campaign-costs-range', dateRange],
    queryFn: async () => {
      if (!isValidRange) return [];
      return fetchCampaignCostsByDateRange(dateRange.from!, dateRange.to!);
    },
    enabled: isValidRange,
  });

  // Fetch raw visit data for detailed analysis
  const { data: rawVisitData, isLoading: isLoadingRawData } = useQuery({
    queryKey: ['campaign-raw-visits', dateRange],
    queryFn: async () => {
      if (!isValidRange) return [];

      const { data, error } = await supabase
        .from('campaign_visits')
        .select('*')
        .gte('timestamp', dateRange.from!.toISOString())
        .lte('timestamp', dateRange.to!.toISOString());

      if (error) throw error;

      // Filter out development/preview domains
      return data.filter(visit => 
        !isExcludedDomain(visit.page_url) && 
        (!visit.referrer || !isExcludedDomain(visit.referrer))
      );
    },
    enabled: isValidRange,
  });

  // Calculate summary metrics
  const summaryData: SummaryMetrics | null = !isValidRange ? null : (() => {
    // If data isn't loaded yet
    if (isLoadingRawData || isLoadingCosts || isLoadingAggregated || !rawVisitData) {
      return null;
    }

    // Calculate total costs from campaign costs
    const totalCosts = costData?.reduce((sum, cost) => {
      // If campaign is longer than the date range, prorate the costs
      const costStartDate = new Date(cost.start_date);
      const costEndDate = new Date(cost.end_date);
      const rangeStartDate = dateRange.from!;
      const rangeEndDate = dateRange.to!;
      
      // Calculate overlap days
      const overlapStart = costStartDate < rangeStartDate ? rangeStartDate : costStartDate;
      const overlapEnd = costEndDate > rangeEndDate ? rangeEndDate : costEndDate;
      const overlapDays = Math.max(0, Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      // Calculate prorated cost
      const totalDays = Math.ceil((costEndDate.getTime() - costStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const proratedCost = (cost.daily_budget * overlapDays);
      
      return sum + proratedCost;
    }, 0) || 0;

    // Total revenue from converted visits
    const totalRevenue = rawVisitData.reduce((sum, visit) => sum + (visit.revenue || 0), 0);

    // Calculate metrics from raw data
    const total_visits = rawVisitData.length;
    const total_conversions = rawVisitData.filter(visit => visit.converted_to_booking).length;
    const overall_conversion_rate = (total_conversions / total_visits) * 100 || 0;

    // Calculate TikTok-specific metrics
    const tiktok_visits = rawVisitData.filter(visit => 
      visit.utm_source?.toLowerCase() === 'tiktok' || 
      visit.referrer?.includes('tiktok.com')
    );
    const tiktok_total = tiktok_visits.length;
    const tiktok_conversions = tiktok_visits.filter(visit => visit.converted_to_booking).length;
    const tiktok_conversion_rate = (tiktok_conversions / tiktok_total) * 100 || 0;

    // Get bounce rate and session duration from aggregated data
    const avgBounceRate = aggregatedData?.reduce((sum, day) => sum + (day.bounce_rate || 0), 0) / (aggregatedData?.length || 1);
    const avgSessionDuration = aggregatedData?.reduce((sum, day) => sum + (day.avg_session_duration || 0), 0) / (aggregatedData?.length || 1);

    // Calculate advanced metrics
    const uniqueVisitors = new Set(rawVisitData.map(v => v.browser_info?.['userAgent'])).size;
    const conversionRate = overall_conversion_rate;
    const roas = totalCosts > 0 ? (totalRevenue / totalCosts) * 100 : 0;
    const cpl = total_visits > 0 ? totalCosts / total_visits : 0;
    const cac = total_conversions > 0 ? totalCosts / total_conversions : 0;

    const metrics = {
      visits: total_visits,
      uniqueVisitors,
      conversions: total_conversions,
      conversionRate,
      revenue: totalRevenue,
      costs: totalCosts,
      roas,
      cpl,
      cac,
      bounceRate: avgBounceRate || 0,
      averageSessionDuration: avgSessionDuration || 0,
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
    };
  })();

  // Prepare timeline data
  const timelineData = !isValidRange ? [] : (() => {
    if (isLoadingRawData || !rawVisitData) return [];

    const dailyData: { [key: string]: TimelineDataPoint } = rawVisitData.reduce((acc, visit) => {
      const dateStr = visit.timestamp?.split('T')[0] || '';
      const isTikTok = visit.utm_source?.toLowerCase() === 'tiktok' || 
                      visit.referrer?.includes('tiktok.com');
      const deviceType = (visit.device_type?.toLowerCase() || 'desktop') as keyof DeviceMetrics;
      
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
          },
          costs: 0,
          revenue: 0,
          bounceRate: 0,
          avgSessionDuration: 0
        };
      }
      
      acc[dateStr].visits++;
      if (visit.converted_to_booking) {
        acc[dateStr].conversions++;
        acc[dateStr].revenue = (acc[dateStr].revenue || 0) + (visit.revenue || 0);
      }
      if (isTikTok) {
        acc[dateStr].tiktok_visits++;
      }
      if (deviceType in acc[dateStr].deviceBreakdown) {
        acc[dateStr].deviceBreakdown[deviceType]++;
      }

      // Bounce and session data
      if (visit.bounce !== null) {
        const bounceCount = acc[dateStr].bounceRate || 0;
        const totalBounceChecks = acc[dateStr].visits;
        acc[dateStr].bounceRate = ((bounceCount * (totalBounceChecks - 1)) + (visit.bounce ? 1 : 0)) / totalBounceChecks;
      }
      
      return acc;
    }, {} as { [key: string]: TimelineDataPoint });
    
    // Add cost data to each day
    costData?.forEach(cost => {
      const costStartDate = new Date(cost.start_date);
      const costEndDate = new Date(cost.end_date);
      
      // For each day in the cost date range
      const currentDate = new Date(costStartDate);
      while (currentDate <= costEndDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (dailyData[dateStr]) {
          dailyData[dateStr].costs = (dailyData[dateStr].costs || 0) + cost.daily_budget;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Add aggregated data
    aggregatedData?.forEach(day => {
      const dateStr = day.day.split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].avgSessionDuration = day.avg_session_duration || 0;
      }
    });
    
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  })();

  // Prepare traffic source distribution data
  const sourceData = !isValidRange ? [] : (() => {
    if (isLoadingRawData || !rawVisitData) return [];

    const distribution: { [key: string]: number } = rawVisitData.reduce((acc, visit) => {
      let source = 'Direct';
      if (visit.utm_source) {
        source = visit.utm_source;
      } else if (visit.referrer?.includes('tiktok.com')) {
        source = 'TikTok';
      } else if (visit.referrer) {
        try {
          source = new URL(visit.referrer).hostname;
        } catch {
          source = visit.referrer;
        }
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
    }));
  })();

  return {
    summaryData,
    isLoadingSummary: isLoadingRawData || isLoadingCosts || isLoadingAggregated,
    timelineData,
    sourceData,
    costData,
    isLoadingCosts
  };
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
