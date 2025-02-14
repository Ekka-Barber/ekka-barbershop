
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

interface BookingBehavior {
  step: string;
  timestamp: string;
}

interface ServiceStats {
  name: string;
  added: number;
  removed: number;
  net: number;
}

interface StepStats {
  name: string;
  count: number;
}

interface RawServiceTracking {
  service_name: string;
  action: string;
  timestamp: string;
}

const CustomerTrackingDashboard = () => {
  // Fetch service tracking data
  const { data: serviceTracking, isLoading: serviceLoading, error: serviceError } = useQuery<ServiceTracking[]>({
    queryKey: ['service-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_tracking')
        .select('service_name, action, timestamp')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Validate and transform the data to ensure action is 'added' or 'removed'
      return (data as RawServiceTracking[]).map(item => ({
        ...item,
        action: item.action === 'added' || item.action === 'removed' 
          ? item.action 
          : 'added' // default fallback
      })) as ServiceTracking[];
    }
  });

  // Fetch booking behavior data
  const { data: bookingBehavior, isLoading: bookingLoading, error: bookingError } = useQuery<BookingBehavior[]>({
    queryKey: ['booking-behavior'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_behavior')
        .select('step, timestamp')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as BookingBehavior[];
    }
  });

  // Process service tracking data
  const processServiceStats = (): ServiceStats[] => {
    if (!serviceTracking) return [];
    
    const stats = new Map<string, { added: number; removed: number }>();
    
    serviceTracking.forEach((track) => {
      if (!stats.has(track.service_name)) {
        stats.set(track.service_name, { added: 0, removed: 0 });
      }
      const current = stats.get(track.service_name)!;
      if (track.action === 'added') {
        current.added++;
      } else if (track.action === 'removed') {
        current.removed++;
      }
    });

    return Array.from(stats.entries()).map(([name, counts]) => ({
      name,
      added: counts.added,
      removed: counts.removed,
      net: counts.added - counts.removed
    }));
  };

  // Process booking behavior data
  const processBookingSteps = (): StepStats[] => {
    if (!bookingBehavior) return [];
    
    const stepCounts = new Map<string, number>();
    bookingBehavior.forEach((behavior) => {
      stepCounts.set(behavior.step, (stepCounts.get(behavior.step) || 0) + 1);
    });

    return Array.from(stepCounts.entries()).map(([name, count]) => ({
      name,
      count
    }));
  };

  if (serviceLoading || bookingLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (serviceError || bookingError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>
          Error loading tracking data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const serviceStats = processServiceStats();
  const bookingStats = processBookingSteps();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Service Selection Tracking</CardTitle>
          <CardDescription>Shows how many times services were added or removed from bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="added" fill="#4ade80" name="Added" />
                <Bar dataKey="removed" fill="#f87171" name="Removed" />
                <Bar dataKey="net" fill="#60a5fa" name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Step Completion</CardTitle>
          <CardDescription>Shows how many users reached each step of the booking process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest service selection and booking step activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceTracking && serviceTracking.slice(0, 10).map((track, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className={track.action === 'added' ? 'text-green-600' : 'text-red-600'}>
                    {track.action === 'added' ? 'Added' : 'Removed'}
                  </span>
                  {' '}{track.service_name}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(track.timestamp), 'MMM d, yyyy HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTrackingDashboard;
