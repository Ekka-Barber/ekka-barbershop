
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Calendar, Users, TrendingUp, CreditCard } from "lucide-react";
import { useTrackingData } from "./useTrackingData";
import { 
  processServiceStats, 
  processBookingSteps, 
  processDeviceStats, 
  processTimePatterns,
  calculateBookingValues,
  processServiceHeatmapData,
  processCustomerJourney
} from "./trackingUtils";
import { TimePatternCard } from "./TimePatternCard";
import { ServiceHeatmapCard } from "./ServiceHeatmapCard";
import { CustomerJourneyCard } from "./CustomerJourneyCard";
import { BookingStepsCard } from "./BookingStepsCard";
import { BookingValuesCard } from "./BookingValuesCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CustomerTrackingDashboard = () => {
  const { 
    serviceTracking, 
    bookingBehavior, 
    bookingsData, 
    serviceDiscovery,
    customerJourneyData,
    isLoading, 
    error 
  } = useTrackingData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Error loading tracking data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const serviceStats = processServiceStats(serviceTracking);
  const bookingStats = processBookingSteps(bookingBehavior);
  const deviceStats = processDeviceStats(bookingsData);
  const timePatterns = processTimePatterns(bookingsData);
  const bookingValues = calculateBookingValues(bookingsData);
  const heatmapData = processServiceHeatmapData(serviceDiscovery);
  const journeyData = processCustomerJourney(customerJourneyData);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingStats.length}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingsData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              +10.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">
              +2.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingValues.average.toFixed(0)} SAR</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Booking Steps and Values */}
      <div className="grid gap-4 md:grid-cols-2">
        <BookingStepsCard bookingStats={bookingStats} />
        <BookingValuesCard bookingValues={bookingValues} />
      </div>
    </div>
  );
};

export default CustomerTrackingDashboard;
