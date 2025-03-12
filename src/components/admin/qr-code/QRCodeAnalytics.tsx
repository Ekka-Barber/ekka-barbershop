
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCode } from '@/types/admin';

interface QRScanData {
  qr_id: string;
  scan_count: number;
  device_breakdown: Record<string, number>;
  referrer_breakdown: Record<string, number>;
  daily_scans: {
    date: string;
    count: number;
  }[];
  recent_scans: {
    scanned_at: string;
    device_type: string;
    referrer: string;
    location?: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

export const QRCodeAnalytics = ({ qrCodes }: { qrCodes: QRCode[] }) => {
  const [selectedQrId, setSelectedQrId] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7days');
  
  useEffect(() => {
    if (qrCodes.length > 0 && !selectedQrId) {
      setSelectedQrId(qrCodes[0].id);
    }
  }, [qrCodes, selectedQrId]);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["qrAnalytics", selectedQrId, timeRange],
    queryFn: async () => {
      if (!selectedQrId) return null;
      
      let daysLookback = 7;
      if (timeRange === '30days') daysLookback = 30;
      if (timeRange === '90days') daysLookback = 90;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysLookback);
      
      // Fetch total scan count
      const { count: scanCount, error: countError } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true })
        .eq('qr_id', selectedQrId)
        .gte('scanned_at', startDate.toISOString());
        
      if (countError) throw countError;
      
      // Fetch daily scan counts
      const { data: dailyScanData, error: dailyError } = await supabase
        .from('qr_scan_counts_daily')
        .select('*')
        .eq('qr_id', selectedQrId)
        .gte('scan_date', startDate.toISOString())
        .lte('scan_date', endDate.toISOString())
        .order('scan_date');
        
      if (dailyError) throw dailyError;
      
      // Fetch device breakdown
      const { data: deviceData, error: deviceError } = await supabase
        .from('qr_scans')
        .select('device_type, count')
        .eq('qr_id', selectedQrId)
        .gte('scanned_at', startDate.toISOString())
        .group('device_type');
        
      if (deviceError) throw deviceError;
      
      // Fetch referrer breakdown
      const { data: referrerData, error: referrerError } = await supabase
        .from('qr_scans')
        .select('referrer, count')
        .eq('qr_id', selectedQrId)
        .gte('scanned_at', startDate.toISOString())
        .group('referrer');
        
      if (referrerError) throw referrerError;
      
      // Fetch recent scans
      const { data: recentScans, error: recentError } = await supabase
        .from('qr_scans')
        .select('scanned_at, device_type, referrer, location')
        .eq('qr_id', selectedQrId)
        .order('scanned_at', { ascending: false })
        .limit(5);
        
      if (recentError) throw recentError;
      
      // Process data for device and referrer breakdowns
      const deviceBreakdown: Record<string, number> = {};
      deviceData?.forEach(item => {
        const deviceType = item.device_type || 'unknown';
        deviceBreakdown[deviceType] = parseInt(item.count);
      });
      
      const referrerBreakdown: Record<string, number> = {};
      referrerData?.forEach(item => {
        const referrer = item.referrer ? new URL(item.referrer).hostname || 'Direct' : 'Direct';
        referrerBreakdown[referrer] = parseInt(item.count);
      });
      
      // Format daily scans data
      const dailyScans = dailyScanData?.map(item => ({
        date: new Date(item.scan_date).toISOString().split('T')[0],
        count: item.scan_count
      })) || [];
      
      // Fill in missing dates with zero counts
      const allDates = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        allDates.push(new Date(d).toISOString().split('T')[0]);
      }
      
      const filledDailyScans = allDates.map(date => {
        const existing = dailyScans.find(scan => scan.date === date);
        return existing || { date, count: 0 };
      });
      
      return {
        qr_id: selectedQrId,
        scan_count: scanCount || 0,
        device_breakdown: deviceBreakdown,
        referrer_breakdown: referrerBreakdown,
        daily_scans: filledDailyScans,
        recent_scans: recentScans || []
      } as QRScanData;
    },
    enabled: !!selectedQrId,
  });

  if (!qrCodes.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-8 text-muted-foreground">
            No QR codes found. Create a QR code first to view analytics.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for charts
  const deviceData = analyticsData?.device_breakdown ? 
    Object.entries(analyticsData.device_breakdown).map(([name, value]) => ({ name, value })) : 
    [];
    
  const referrerData = analyticsData?.referrer_breakdown ? 
    Object.entries(analyticsData.referrer_breakdown).map(([name, value]) => ({ name, value })) : 
    [];

  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">QR Code Analytics</h2>
        <p className="text-muted-foreground">
          Track how your QR codes are being used and measure their performance.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Select 
          value={selectedQrId || ''} 
          onValueChange={setSelectedQrId}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select QR Code" />
          </SelectTrigger>
          <SelectContent>
            {qrCodes.map(qr => (
              <SelectItem key={qr.id} value={qr.id}>
                {qr.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={timeRange} 
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-full md:w-[150px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            {timeRangeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : analyticsData ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overview</CardTitle>
              <CardDescription>Summary of QR code performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total Scans</p>
                    <p className="text-3xl font-bold">{analyticsData.scan_count}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Avg. Daily</p>
                    <p className="text-3xl font-bold">
                      {Math.round(analyticsData.scan_count / (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90))}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Daily Scans</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analyticsData.daily_scans}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Breakdown</CardTitle>
              <CardDescription>Where and how your QR code is being scanned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">Device Types</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
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
                <div>
                  <h3 className="text-sm font-medium mb-2 text-center">Traffic Sources</h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={referrerData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {referrerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Scan Details</CardTitle>
              <CardDescription>Recent scans of this QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.recent_scans.length > 0 ? (
                    analyticsData.recent_scans.map((scan, i) => {
                      // Parse referrer to get a readable source
                      let source = 'Direct';
                      if (scan.referrer) {
                        try {
                          const url = new URL(scan.referrer);
                          source = url.hostname;
                        } catch (e) {
                          source = scan.referrer;
                        }
                      }
                      
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {new Date(scan.scanned_at).toLocaleString()}
                          </TableCell>
                          <TableCell>{scan.device_type || 'Unknown'}</TableCell>
                          <TableCell>{source}</TableCell>
                          <TableCell className="text-right">{scan.location || 'Unknown'}</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No scan data available for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          Select a QR code to view analytics.
        </div>
      )}
    </div>
  );
};
