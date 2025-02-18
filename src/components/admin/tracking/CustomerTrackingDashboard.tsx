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
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { GeographicInsights } from './GeographicInsights';

const ITEMS_PER_PAGE = 50;

const CustomerTrackingDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [currentPage, setCurrentPage] = useState(0);

  const { 
    coreMetrics,
    isLoading,
    sessionData,
    bookingData,
    interactionEvents,
    previousPeriodData,
    totalCounts
  } = useTrackingData(dateRange, { page: currentPage, pageSize: ITEMS_PER_PAGE });

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

  const totalPages = Math.ceil(Math.max(
    totalCounts.sessions,
    totalCounts.bookings,
    totalCounts.interactions
  ) / ITEMS_PER_PAGE);

  const predictiveData = {
    busyPeriods: [
      {
        startTime: '10:00',
        endTime: '12:00',
        predictedBookings: 15,
        confidence: 85,
        dayOfWeek: 1
      }
    ],
    revenueForecasts: [
      {
        date: '2024-03-01',
        predictedRevenue: 5000,
        lowerBound: 4500,
        upperBound: 5500,
        confidence: 90
      }
    ],
    seasonalPatterns: [],
    trends: []
  };

  const geographicData: GeographicInsights = {
    branchLocations: [
      {
        id: '1',
        name: 'Main Branch',
        coordinates: [45.0, 25.0] as [number, number],
        performance: {
          bookings: 150,
          revenue: 15000,
          satisfaction: 4.5
        }
      }
    ],
    customerDensity: [
      {
        coordinates: [45.0, 25.0] as [number, number],
        weight: 0.8
      }
    ],
    performanceMetrics: [{
      branchId: '1',
      metrics: {
        bookingsPerCapita: 0.5,
        marketShare: 0.3,
        competitorProximity: 0.8
      }
    }],
    catchmentAreas: [{
      branchId: '1',
      polygon: [[45.0, 25.0], [45.1, 25.1], [45.0, 25.1], [45.0, 25.0]] as [number, number][],
      population: 50000,
      potentialMarket: 10000
    }]
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="overview">Overview & Patterns</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time Monitoring</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="realtime">
          <RealTimeMonitoring />
        </TabsContent>

        <TabsContent value="predictive">
          <PredictiveAnalytics data={predictiveData} />
        </TabsContent>

        <TabsContent value="geographic">
          <GeographicInsights data={geographicData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerTrackingDashboard;
