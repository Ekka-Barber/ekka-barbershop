
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useTrackingData } from "./useTrackingData";
import { 
  processServiceStats, 
  processBookingSteps, 
  processDeviceStats, 
  processTimePatterns, 
  calculateBookingValues 
} from "./trackingUtils";
import { DeviceDistributionCard } from "./DeviceDistributionCard";
import { TimePatternCard } from "./TimePatternCard";
import { ServiceStatsCard } from "./ServiceStatsCard";
import { BookingStepsCard } from "./BookingStepsCard";
import { BookingValuesCard } from "./BookingValuesCard";
import { RecentActivityCard } from "./RecentActivityCard";

const CustomerTrackingDashboard = () => {
  const { serviceTracking, bookingBehavior, bookingsData, isLoading, error } = useTrackingData();

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

  return (
    <div className="space-y-8">
      <DeviceDistributionCard deviceStats={deviceStats} />
      <TimePatternCard timePatterns={timePatterns} />
      <ServiceStatsCard serviceStats={serviceStats} />
      <BookingStepsCard bookingStats={bookingStats} />
      <BookingValuesCard bookingValues={bookingValues} />
      {serviceTracking && <RecentActivityCard serviceTracking={serviceTracking} />}
    </div>
  );
};

export default CustomerTrackingDashboard;
