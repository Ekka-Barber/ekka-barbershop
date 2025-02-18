
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { DateRange, DateRangeSelector } from "./DateRangeSelector";
import { useTrackingData } from "./useTrackingData";
import { CoreMetricsGrid } from "./CoreMetricsGrid";
import { TimePatternCard } from "./TimePatternCard";
import { ServiceHeatmapCard } from "./ServiceHeatmapCard";
import { CustomerJourneyCard } from "./CustomerJourneyCard";
import { processTimePatterns, processServiceHeatmapData, processCustomerJourney } from "./trackingUtils";

const CustomerTrackingDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const { 
    coreMetrics,
    isLoading,
    sessionData,
    bookingData,
    interactionEvents
  } = useTrackingData(dateRange);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!sessionData || !bookingData || !interactionEvents) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Error loading tracking data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const timePatterns = processTimePatterns(bookingData);
  const heatmapData = processServiceHeatmapData(interactionEvents);
  const journeyData = processCustomerJourney(interactionEvents);

  return (
    <div className="space-y-8">
      {/* Date Range Selection */}
      <DateRangeSelector onRangeChange={setDateRange} />

      {/* Core Metrics */}
      <CoreMetricsGrid metrics={coreMetrics} />

      {/* Customer Journey Flow */}
      <CustomerJourneyCard 
        nodes={journeyData.nodes}
        links={journeyData.links}
      />

      {/* Time Patterns and Service Heatmap */}
      <div className="grid gap-4 md:grid-cols-2">
        <TimePatternCard timePatterns={timePatterns} />
        <ServiceHeatmapCard serviceData={heatmapData} />
      </div>
    </div>
  );
};

export default CustomerTrackingDashboard;
