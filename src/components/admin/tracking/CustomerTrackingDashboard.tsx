import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { DateRange, DateRangeSelector } from "./DateRangeSelector";
import { useTrackingData } from "./useTrackingData";
import { CoreMetricsGrid } from "./CoreMetricsGrid";
import { TimePatternCard } from "./TimePatternCard";
import { ServiceHeatmapCard } from "./ServiceHeatmapCard";
import { CustomerJourneyCard } from "./CustomerJourneyCard";
import { RealTimeMonitoring } from "./RealTimeMonitoring";
import { BranchAnalytics } from "./BranchAnalytics";
import { PeriodComparison } from "./PeriodComparison";
import { processTimePatterns, processServiceHeatmapData, processCustomerJourney } from "./trackingUtils";
import { calculatePeriodMetrics } from "./analyticsUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropOffAnalysisCard } from "./DropOffAnalysisCard";
import { ServiceBundleCard } from "./ServiceBundleCard";
import { PathOptimizationCard } from "./PathOptimizationCard";

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
    interactionEvents,
    previousPeriodData
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
  
  const periodMetrics = calculatePeriodMetrics(interactionEvents, previousPeriodData || []);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="overview">Overview & Patterns</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time Monitoring</TabsTrigger>
          <TabsTrigger value="branches">Branch Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <DateRangeSelector onRangeChange={setDateRange} />
          
          <div className="grid gap-4 md:grid-cols-3">
            <PeriodComparison
              title="Active Users"
              {...periodMetrics.sessions}
              format={(value) => value.toString()}
            />
            <PeriodComparison
              title="Bookings"
              {...periodMetrics.bookings}
              format={(value) => value.toString()}
            />
            <PeriodComparison
              title="Conversion Rate"
              {...periodMetrics.conversionRate}
              format={(value) => `${value.toFixed(1)}%`}
            />
          </div>

          <CoreMetricsGrid metrics={coreMetrics} />
          <CustomerJourneyCard nodes={journeyData.nodes} links={journeyData.links} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <DropOffAnalysisCard dropOffPoints={journeyData.dropOffPoints} />
            <PathOptimizationCard optimizations={journeyData.pathOptimizations} />
          </div>
          
          <ServiceBundleCard bundles={journeyData.serviceBundles} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <TimePatternCard timePatterns={timePatterns} />
            <ServiceHeatmapCard serviceData={heatmapData} />
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeMonitoring />
        </TabsContent>

        <TabsContent value="branches">
          <BranchAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerTrackingDashboard;
