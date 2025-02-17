
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, startOfHour, endOfHour } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Smartphone, Monitor } from "lucide-react";

interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

interface BookingBehavior {
  step: string;
  timestamp: string;
}

interface BookingData {
  id: string;
  device_type: 'mobile' | 'desktop';
  browser_info: {
    userAgent: string;
    language: string;
  };
  services: any[];
  total_price: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
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

const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];

const CustomerTrackingDashboard = () => {
  // Fetch service tracking data
  const { data: serviceTracking, isLoading: serviceLoading, error: serviceError } = useQuery({
    queryKey: ['service-tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_tracking')
        .select('service_name, action, timestamp')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ServiceTracking[];
    }
  });

  // Fetch booking behavior data
  const { data: bookingBehavior, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: ['booking-behavior'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_behavior')
        .select('step, timestamp')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingBehavior[];
    }
  });

  // Fetch bookings data
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['bookings-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          device_type,
          browser_info,
          services,
          total_price,
          appointment_date,
          appointment_time,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BookingData[];
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
    })).sort((a, b) => b.count - a.count);
  };

  // Process device type statistics
  const processDeviceStats = () => {
    if (!bookingsData) return { mobile: 0, desktop: 0 };
    
    return bookingsData.reduce((acc, booking) => {
      acc[booking.device_type] = (acc[booking.device_type] || 0) + 1;
      return acc;
    }, { mobile: 0, desktop: 0 });
  };

  // Process booking time patterns
  const processTimePatterns = () => {
    if (!bookingsData) return [];
    
    const hourCounts = new Map<number, number>();
    bookingsData.forEach((booking) => {
      const hour = new Date(booking.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    return Array.from(hourCounts.entries())
      .map(([hour, count]) => ({
        hour: hour,
        count: count,
        label: `${hour}:00`
      }))
      .sort((a, b) => a.hour - b.hour);
  };

  // Calculate average booking value
  const calculateBookingValues = () => {
    if (!bookingsData || bookingsData.length === 0) return { average: 0, total: 0 };
    
    const total = bookingsData.reduce((sum, booking) => sum + booking.total_price, 0);
    return {
      average: total / bookingsData.length,
      total: total
    };
  };

  if (serviceLoading || bookingLoading || bookingsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (serviceError || bookingError || bookingsError) {
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
  const deviceStats = processDeviceStats();
  const timePatterns = processTimePatterns();
  const bookingValues = calculateBookingValues();

  const deviceData = [
    { name: 'Mobile', value: deviceStats.mobile },
    { name: 'Desktop', value: deviceStats.desktop }
  ];

  return (
    <div className="space-y-8">
      {/* Device Distribution Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Device Distribution</CardTitle>
          <CardDescription>Shows how customers are accessing the booking system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center">
              <Smartphone className="mr-2 h-4 w-4 text-green-500" />
              <span>Mobile: {deviceStats.mobile}</span>
            </div>
            <div className="flex items-center">
              <Monitor className="mr-2 h-4 w-4 text-red-500" />
              <span>Desktop: {deviceStats.desktop}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Time Patterns Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Time Patterns</CardTitle>
          <CardDescription>Shows when customers are most likely to book</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timePatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#60a5fa" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Service Selection Tracking</CardTitle>
          <CardDescription>Shows how many times services were added or removed from bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rtl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={serviceStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name"
                  type="category"
                  width={150}
                  tick={{ 
                    fontSize: 12,
                    width: 140,
                    textAnchor: 'end'
                  }}
                />
                <Tooltip />
                <Bar dataKey="added" fill="#4ade80" name="Added" />
                <Bar dataKey="removed" fill="#f87171" name="Removed" />
                <Bar dataKey="net" fill="#60a5fa" name="Net" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Booking Step Completion Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Step Completion</CardTitle>
          <CardDescription>Shows how many users reached each step of the booking process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Booking Values Card */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Values</CardTitle>
          <CardDescription>Summary of booking financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600">Average Booking Value</div>
              <div className="text-2xl font-bold">{bookingValues.average.toFixed(2)} SAR</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-green-600">Total Booking Value</div>
              <div className="text-2xl font-bold">{bookingValues.total.toFixed(2)} SAR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest service selection and booking step activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {serviceTracking && serviceTracking.slice(0, 10).map((track, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2 rtl">
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
