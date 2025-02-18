
interface ComparisonMetric {
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

export const calculateComparison = (current: number, previous: number): ComparisonMetric => {
  const percentageChange = previous ? ((current - previous) / previous) * 100 : 0;
  const trend = percentageChange > 1 ? 'up' : percentageChange < -1 ? 'down' : 'stable';
  
  return {
    current,
    previous,
    percentageChange,
    trend
  };
};

export const calculatePeriodMetrics = (currentData: any[], previousData: any[]) => {
  const uniqueCurrentSessions = new Set(currentData.map(d => d.session_id)).size;
  const uniquePreviousSessions = new Set(previousData.map(d => d.session_id)).size;
  
  const currentBookings = currentData.filter(d => d.interaction_type === 'booking_complete').length;
  const previousBookings = previousData.filter(d => d.interaction_type === 'booking_complete').length;
  
  return {
    sessions: calculateComparison(uniqueCurrentSessions, uniquePreviousSessions),
    bookings: calculateComparison(currentBookings, previousBookings),
    conversionRate: calculateComparison(
      (currentBookings / uniqueCurrentSessions) * 100,
      (previousBookings / uniquePreviousSessions) * 100
    )
  };
};
