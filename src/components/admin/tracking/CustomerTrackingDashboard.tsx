
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { DateRange, DateRangeSelector } from "./DateRangeSelector";
import { useTrackingData } from "./useTrackingData";
import { CoreMetricsGrid } from "./CoreMetricsGrid";
import { TimePatternCard } from "./TimePatternCard";
import { ServiceHeatmapCard } from "./ServiceHeatmapCard";
import { CustomerJourneyCard } from "./CustomerJourneyCard";
import { LightweightMonitoring } from "./LightweightMonitoring";
import { BranchAnalytics } from "./BranchAnalytics";
import { PeriodComparison } from "./PeriodComparison";
import { processTimePatterns, processServiceHeatmapData, processCustomerJourney } from "./trackingUtils";
import { calculatePeriodMetrics } from "./analyticsUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropOffAnalysisCard } from "./DropOffAnalysisCard";
import { ServiceBundleCard } from "./ServiceBundleCard";
import { PathOptimizationCard } from "./PathOptimizationCard";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { GeographicInsights } from './GeographicInsights';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { toast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 20; // Reduced from 50 to better handle smaller datasets

const CustomerTrackingDashboard = () => {
  // Set default date range to last 30 days instead of future dates
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const { 
    coreMetrics,
    isLoading,
    error,
    sessionData,
    bookingData,
    interactionEvents,
    previousPeriodData,
    totalCounts
  } = useTrackingData(
    dateRange, 
    activeTab === "overview" ? { page: currentPage, pageSize: ITEMS_PER_PAGE } : undefined
  );

  const handleDateRangeChange = (newRange: DateRange) => {
    // Validate date range
    if (newRange.to > new Date()) {
      toast({
        title: "Invalid Date Range",
        description: "Cannot select future dates for tracking data",
        variant: "destructive"
      });
      return;
    }
    setDateRange(newRange);
    setCurrentPage(0); // Reset to first page when date range changes
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || "Error loading tracking data. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Only process data if it exists
  const timePatterns = Array.isArray(bookingData) && bookingData.length > 0 
    ? processTimePatterns(bookingData) 
    : [];

  const heatmapData = Array.isArray(interactionEvents) && interactionEvents.length > 0 
    ? processServiceHeatmapData(interactionEvents) 
    : [];

  const journeyData = Array.isArray(interactionEvents) && interactionEvents.length > 0 
    ? processCustomerJourney(interactionEvents) 
    : { nodes: [], links: [] };

  const periodMetrics = calculatePeriodMetrics(
    Array.isArray(interactionEvents) ? interactionEvents : [], 
    Array.isArray(previousPeriodData) ? previousPeriodData : []
  );

  // Calculate total pages based on the smallest non-zero count to prevent range errors
  const totalPages = Math.max(1, Math.ceil(Math.min(
    totalCounts?.sessions || Infinity,
    totalCounts?.bookings || Infinity,
    totalCounts?.interactions || Infinity,
    ITEMS_PER_PAGE
  ) / ITEMS_PER_PAGE));

  // Ensure currentPage stays within bounds
  if (currentPage >= totalPages) {
    setCurrentPage(Math.max(0, totalPages - 1));
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview">Overview & Patterns</TabsTrigger>
          <TabsTrigger value="realtime">Monitoring</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ErrorBoundary>
            <div className="flex justify-between items-center">
              <DateRangeSelector onRangeChange={handleDateRangeChange} />
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage(0);
                  window.location.reload();
                }}
              >
                Refresh Data
              </Button>
            </div>

            {(!sessionData?.length && !bookingData?.length && !interactionEvents?.length) ? (
              <Alert>
                <AlertDescription>
                  No tracking data available for the selected date range. Try selecting a different period.
                </AlertDescription>
              </Alert>
            ) : (
              <>
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

                {coreMetrics && <CoreMetricsGrid metrics={coreMetrics} />}
                
                {journeyData.nodes.length > 0 && (
                  <CustomerJourneyCard 
                    nodes={journeyData.nodes} 
                    links={journeyData.links} 
                  />
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  {timePatterns.length > 0 && (
                    <TimePatternCard timePatterns={timePatterns} />
                  )}
                  {heatmapData.length > 0 && (
                    <ServiceHeatmapCard serviceData={heatmapData} />
                  )}
                </div>

                {totalPages > 1 && activeTab === "overview" && (
                  <div className="flex justify-center mt-4">
                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="realtime">
          <ErrorBoundary>
            <LightweightMonitoring />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="predictive">
          <ErrorBoundary>
            <PredictiveAnalytics data={undefined} />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="geographic">
          <ErrorBoundary>
            <GeographicInsights data={undefined} />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerTrackingDashboard;
