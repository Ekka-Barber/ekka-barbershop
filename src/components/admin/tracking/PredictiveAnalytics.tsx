
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { PredictiveAnalyticsProps, BusyPeriod } from './types';
import { Loader2 } from "lucide-react";

export const PredictiveAnalytics = ({ data }: PredictiveAnalyticsProps) => {
  const [predictiveData, setPredictiveData] = useState(data);
  
  const { data: bookingPatterns, isLoading } = useQuery({
    queryKey: ['booking-patterns'],
    queryFn: async () => {
      const { data: bookings } = await supabase
        .from('unified_events')
        .select('*')
        .eq('event_type', 'business')
        .eq('event_name', 'booking_completed')
        .order('timestamp', { ascending: true });

      if (!bookings) return null;

      // Process booking data to predict patterns
      const busyPeriods = analyzeBusyPeriods(bookings);
      const revenueForecasts = generateRevenueForecasts(bookings);
      const seasonalPatterns = analyzeSeasonalPatterns(bookings);
      const trends = analyzeTrends(bookings);

      return {
        busyPeriods,
        revenueForecasts,
        seasonalPatterns,
        trends
      };
    }
  });

  useEffect(() => {
    if (bookingPatterns) {
      setPredictiveData(bookingPatterns);
    }
  }, [bookingPatterns]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!predictiveData) {
    return (
      <Card>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">
            Not enough data to generate predictions yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={predictiveData.revenueForecasts}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedRevenue" 
                    stroke="#4ade80" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="#94a3b8" 
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Busy Periods Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictiveData.busyPeriods.map((period, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {period.startTime} - {period.endTime}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Predicted Bookings: {period.predictedBookings}
                    </div>
                  </div>
                  <div className="text-sm">
                    {period.confidence.toFixed(1)}% confidence
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictiveData.seasonalPatterns.map((pattern, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-secondary/20 rounded-lg">
                <div>
                  <div className="font-medium">{pattern.period}</div>
                  <div className="text-sm text-muted-foreground">{pattern.pattern}</div>
                </div>
                <div className="text-sm">
                  Strength: {pattern.strength.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const analyzeBusyPeriods = (bookings: any[]): BusyPeriod[] => {
  // Group bookings by hour and day of week
  const hourlyPatterns = bookings.reduce((acc, booking) => {
    const date = new Date(booking.timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    const key = `${day}-${hour}`;
    
    if (!acc[key]) {
      acc[key] = {
        count: 0,
        total: 0
      };
    }
    
    acc[key].count++;
    acc[key].total += booking.event_data?.total_amount || 0;
    
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  // Convert to busy periods
  return Object.entries(hourlyPatterns)
    .map(([key, data]) => {
      const [day, hour] = key.split('-').map(Number);
      const predictedBookings = Math.round(data.count / (bookings.length / 100));
      
      return {
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        predictedBookings,
        confidence: Math.min(95, Math.round((data.count / bookings.length) * 100)),
        dayOfWeek: day
      };
    })
    .filter(period => period.predictedBookings > 0)
    .sort((a, b) => b.predictedBookings - a.predictedBookings);
};

const generateRevenueForecasts = (bookings: any[]) => {
  // Group bookings by date
  const dailyRevenue = bookings.reduce((acc, booking) => {
    const date = new Date(booking.timestamp).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += booking.event_data?.total_amount || 0;
    return acc;
  }, {} as Record<string, number>);

  // Generate forecasts for the next 7 days
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today.getTime() + index * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    
    const avgRevenue = Object.values(dailyRevenue).reduce((a, b) => a + b, 0) / 
      Object.keys(dailyRevenue).length;
    
    const variance = Math.max(avgRevenue * 0.2, 100); // 20% variance or minimum 100
    
    return {
      date,
      predictedRevenue: Math.round(avgRevenue),
      lowerBound: Math.round(avgRevenue - variance),
      upperBound: Math.round(avgRevenue + variance),
      confidence: 80
    };
  });
};

const analyzeSeasonalPatterns = (bookings: any[]) => {
  // Analyze patterns by month, day of week, and time of day
  const patterns = [
    analyzeMonthlyPattern(bookings),
    analyzeDailyPattern(bookings),
    analyzeHourlyPattern(bookings)
  ].filter(Boolean);

  return patterns;
};

const analyzeMonthlyPattern = (bookings: any[]) => {
  const monthlyBookings = bookings.reduce((acc, booking) => {
    const month = new Date(booking.timestamp).getMonth();
    if (!acc[month]) acc[month] = 0;
    acc[month]++;
    return acc;
  }, {} as Record<number, number>);

  const maxMonth = Object.entries(monthlyBookings)
    .sort(([, a], [, b]) => b - a)[0];

  if (!maxMonth) return null;

  return {
    period: 'Monthly',
    pattern: `Peak bookings in ${new Date(2000, parseInt(maxMonth[0])).toLocaleString('default', { month: 'long' })}`,
    strength: calculatePatternStrength(Object.values(monthlyBookings)),
    significance: 0.8
  };
};

const analyzeDailyPattern = (bookings: any[]) => {
  const dailyBookings = bookings.reduce((acc, booking) => {
    const day = new Date(booking.timestamp).getDay();
    if (!acc[day]) acc[day] = 0;
    acc[day]++;
    return acc;
  }, {} as Record<number, number>);

  const maxDay = Object.entries(dailyBookings)
    .sort(([, a], [, b]) => b - a)[0];

  if (!maxDay) return null;

  return {
    period: 'Weekly',
    pattern: `Peak bookings on ${new Date(2000, 0, parseInt(maxDay[0]) + 2).toLocaleString('default', { weekday: 'long' })}s`,
    strength: calculatePatternStrength(Object.values(dailyBookings)),
    significance: 0.9
  };
};

const analyzeHourlyPattern = (bookings: any[]) => {
  const hourlyBookings = bookings.reduce((acc, booking) => {
    const hour = new Date(booking.timestamp).getHours();
    if (!acc[hour]) acc[hour] = 0;
    acc[hour]++;
    return acc;
  }, {} as Record<number, number>);

  const maxHour = Object.entries(hourlyBookings)
    .sort(([, a], [, b]) => b - a)[0];

  if (!maxHour) return null;

  const hourString = `${parseInt(maxHour[0])}:00`;
  
  return {
    period: 'Daily',
    pattern: `Peak bookings around ${hourString}`,
    strength: calculatePatternStrength(Object.values(hourlyBookings)),
    significance: 0.85
  };
};

const calculatePatternStrength = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  
  // Calculate strength based on variance from average
  const strength = ((max - min) / (avg || 1)) * 100;
  
  return Math.min(Math.round(strength), 100);
};

const analyzeTrends = (bookings: any[]) => {
  if (bookings.length === 0) return [];

  // Sort bookings by date
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Group by week
  const weeklyData = sortedBookings.reduce((acc, booking) => {
    const date = new Date(booking.timestamp);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!acc[weekKey]) {
      acc[weekKey] = {
        count: 0,
        revenue: 0
      };
    }
    
    acc[weekKey].count++;
    acc[weekKey].revenue += booking.event_data?.total_amount || 0;
    
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return Object.entries(weeklyData).map(([week, data]) => ({
    week,
    bookings: data.count,
    revenue: data.revenue,
    averageValue: data.revenue / data.count
  }));
};
