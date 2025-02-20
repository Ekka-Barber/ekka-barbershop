
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAdsMetrics } from "./hooks/useAdsMetrics";
import { MetricsSummaryCards } from "./components/MetricsSummaryCards";
import { TimelineChart } from "./components/TimelineChart";
import { TrafficSourcesChart } from "./components/TrafficSourcesChart";

export const AdsMetrics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { summaryData, isLoadingSummary, timelineData, sourceData } = useAdsMetrics(dateRange);

  if (isLoadingSummary) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Ads Metrics</h2>
        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
      </div>

      <MetricsSummaryCards summaryData={summaryData} />
      <TimelineChart timelineData={timelineData || []} />
      <TrafficSourcesChart sourceData={sourceData || []} />
    </div>
  );
};
