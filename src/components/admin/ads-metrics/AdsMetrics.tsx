
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// List of domains to exclude from analytics
const EXCLUDED_DOMAINS = [
  'preview--ekka-barbershop.lovable.app',
  'lovable.dev',
  'localhost',
  '127.0.0.1'
];

const isExcludedDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return EXCLUDED_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return false;
  }
};

export const AdsMetrics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

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

      const total_visits = filteredData.length;
      const conversions = filteredData.filter(visit => visit.converted_to_booking).length;
      const conversion_rate = (conversions / total_visits) * 100 || 0;
      const tiktok_visits = filteredData.filter(visit => 
        visit.utm_source?.toLowerCase() === 'tiktok' || 
        visit.referrer?.includes('tiktok.com')
      ).length;

      return {
        total_visits,
        conversions,
        conversion_rate: conversion_rate.toFixed(1),
        tiktok_visits,
        tiktok_percentage: ((tiktok_visits / total_visits) * 100).toFixed(1)
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

      // Filter out development/preview domains
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

      // Filter out development/preview domains
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

  if (isLoadingSummary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Ads Metrics</h2>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.total_visits || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.conversions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.conversion_rate || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TikTok Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData?.tiktok_visits || 0}</div>
            <p className="text-xs text-muted-foreground">
              ({summaryData?.tiktok_percentage || 0}% of total)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="visits" stroke="#8884d8" name="Total Visits" />
              <Line type="monotone" dataKey="tiktok_visits" stroke="#FE2C55" name="TikTok Visits" />
              <Line type="monotone" dataKey="conversions" stroke="#82ca9d" name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Traffic Sources Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceData?.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
