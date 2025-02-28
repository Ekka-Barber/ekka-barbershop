
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { useAdsMetrics } from "./hooks/useAdsMetrics";
import { MetricsSummaryCards } from "./components/MetricsSummaryCards";
import { TimelineChart } from "./components/TimelineChart";
import { TrafficSourcesChart } from "./components/TrafficSourcesChart";
import { CampaignCostManager } from "./components/CampaignCostManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export const AdsMetrics = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  const { 
    summaryData, 
    isLoadingSummary, 
    timelineData, 
    sourceData 
  } = useAdsMetrics(dateRange);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold">Ads Metrics</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <DateRangePicker 
            date={dateRange} 
            onDateChange={setDateRange} 
            className="w-full md:w-auto"
          />
        </div>
      </div>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="costs">Campaign Costs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-8">
          {isLoadingSummary ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-40">
                  <div className="text-center text-muted-foreground">
                    Loading metrics data...
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <MetricsSummaryCards summaryData={summaryData} />
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <TimelineChart timelineData={timelineData} />
                <TrafficSourcesChart sourceData={sourceData} />
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="costs">
          <CampaignCostManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
