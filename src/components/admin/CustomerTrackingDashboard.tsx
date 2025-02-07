
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ServiceTracking {
  service_name: string;
  action: string;
  timestamp: string;
}

interface BookingBehavior {
  step: string;
  timestamp: string;
}

interface ServiceStats {
  service_name: string;
  added_count: number;
  removed_count: number;
}

const CustomerTrackingDashboard = () => {
  const [serviceTracking, setServiceTracking] = useState<ServiceTracking[]>([]);
  const [bookingBehavior, setBookingBehavior] = useState<BookingBehavior[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    try {
      console.log('Fetching tracking data...');
      
      // Fetch service tracking data
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_tracking')
        .select('*')
        .order('timestamp', { ascending: false });

      if (serviceError) {
        console.error('Service tracking error:', serviceError);
        toast.error('Error fetching service tracking data');
        throw serviceError;
      }

      console.log('Service tracking data:', serviceData);

      // Fetch booking behavior data
      const { data: bookingData, error: bookingError } = await supabase
        .from('booking_behavior')
        .select('*')
        .order('timestamp', { ascending: false });

      if (bookingError) {
        console.error('Booking behavior error:', bookingError);
        toast.error('Error fetching booking behavior data');
        throw bookingError;
      }

      console.log('Booking behavior data:', bookingData);

      setServiceTracking(serviceData || []);
      setBookingBehavior(bookingData || []);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Error fetching tracking data');
    } finally {
      setLoading(false);
    }
  };

  const processServiceStats = (): ServiceStats[] => {
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

    return Array.from(stats.entries()).map(([service_name, counts]) => ({
      service_name,
      added_count: counts.added,
      removed_count: counts.removed
    }));
  };

  const processBookingSteps = () => {
    const stepCounts = new Map<string, number>();
    bookingBehavior.forEach((behavior) => {
      stepCounts.set(behavior.step, (stepCounts.get(behavior.step) || 0) + 1);
    });

    return Array.from(stepCounts.entries()).map(([step, count]) => ({
      step,
      count
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Loading tracking data...</div>;
  }

  const serviceStats = processServiceStats();
  const bookingStats = processBookingSteps();

  if (!loading && serviceStats.length === 0 && bookingStats.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-600">No tracking data available yet.</p>
        <p className="text-sm text-gray-500 mt-2">Data will appear here once customers interact with the services and booking system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="services">Service Tracking</TabsTrigger>
          <TabsTrigger value="booking">Booking Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Service Selection Statistics</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="added_count" name="Added" fill="#4CAF50" />
                  <Bar dataKey="removed_count" name="Removed" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Service Interactions</h3>
            <div className="space-y-2">
              {serviceTracking.slice(0, 10).map((track, index) => (
                <div
                  key={index}
                  className="p-2 border rounded flex justify-between items-center"
                >
                  <span className="font-medium">{track.service_name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      track.action === 'added' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {track.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(track.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Booking Step Completion</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Completions" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Recent Step Completions</h3>
            <div className="space-y-2">
              {bookingBehavior.slice(0, 10).map((behavior, index) => (
                <div
                  key={index}
                  className="p-2 border rounded flex justify-between items-center"
                >
                  <span className="font-medium">{behavior.step}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(behavior.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerTrackingDashboard;
