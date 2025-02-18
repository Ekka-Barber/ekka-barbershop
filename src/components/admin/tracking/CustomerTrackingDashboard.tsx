
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
import type { GeographicInsightsType } from './types';

const ITEMS_PER_PAGE = 50;

const CustomerTrackingDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading tracking data: {error.message}
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

  const timePatterns = sessionData ? processTimePatterns(bookingData || []) : [];
  const heatmapData = interactionEvents ? processServiceHeatmapData(interactionEvents) : [];
  const journeyData = interactionEvents ? processCustomerJourney(interactionEvents) : { nodes: [], links: [] };
  const periodMetrics = calculatePeriodMetrics(interactionEvents || [], previousPeriodData || []);

  const totalPages = Math.ceil(Math.max(
    totalCounts?.sessions || 0,
    totalCounts?.bookings || 0,
    totalCounts?.interactions || 0
  ) / ITEMS_PER_PAGE);

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
              <DateRangeSelector onRangeChange={setDateRange} />
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
