
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
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
      
      // This is a mock implementation - actual data would come from Supabase
      // In a real implementation, you would fetch this data from your database
      const mockData: QRScanData = {
        qr_id: selectedQrId,
        scan_count: Math.floor(Math.random() * 200) + 50,
        device_breakdown: {
          "Mobile": Math.floor(Math.random() * 80) + 20,
          "Desktop": Math.floor(Math.random() * 40) + 10,
          "Tablet": Math.floor(Math.random() * 20) + 5,
        },
        referrer_breakdown: {
          "Direct": Math.floor(Math.random() * 50) + 30,
          "Instagram": Math.floor(Math.random() * 30) + 10,
          "Facebook": Math.floor(Math.random() * 20) + 5,
          "WhatsApp": Math.floor(Math.random() * 15) + 5,
        },
        daily_scans: Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 30) + 1
          };
        })
      };
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return mockData;
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
                      {Math.round(analyticsData.scan_count / 7)}
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
                    <TableHead className="text-right">Country</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const devices = ['Mobile', 'Desktop', 'Tablet'];
                    const sources = ['Direct', 'Instagram', 'Facebook', 'WhatsApp'];
                    const countries = ['Saudi Arabia', 'UAE', 'Kuwait', 'Qatar'];
                    
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {date.toLocaleDateString()}
                        </TableCell>
                        <TableCell>{devices[Math.floor(Math.random() * devices.length)]}</TableCell>
                        <TableCell>{sources[Math.floor(Math.random() * sources.length)]}</TableCell>
                        <TableCell className="text-right">{countries[Math.floor(Math.random() * countries.length)]}</TableCell>
                      </TableRow>
                    );
                  })}
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
