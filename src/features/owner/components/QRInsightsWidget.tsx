import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  QrCode,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Scan,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils';
import { supabase } from '@shared/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

interface DailyScan {
  scan_date: string;
  scan_count: number;
  qr_id: string;
}

interface QRCode {
  id: string;
  url: string;
  is_active: boolean;
  created_at: string;
}

export function QRInsightsWidget() {
  // Fetch all QR codes
  const { data: qrCodes = [] } = useQuery<QRCode[]>({
    queryKey: ['qrCodes', 'dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch aggregated scan data for last 7 days
  const { data: scanStats, isLoading } = useQuery({
    queryKey: ['qrScans', 'dashboard', 'stats'],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      const fourteenDaysAgo = subDays(new Date(), 14);

      // Get scans for last 7 days
      const { count: currentWeekScans } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true })
        .gte('scanned_at', sevenDaysAgo.toISOString());

      // Get scans for previous 7 days (for comparison)
      const { count: previousWeekScans } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true })
        .gte('scanned_at', fourteenDaysAgo.toISOString())
        .lt('scanned_at', sevenDaysAgo.toISOString());

      // Get today's scans
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayScans } = await supabase
        .from('qr_scans')
        .select('*', { count: 'exact', head: true })
        .gte('scanned_at', today.toISOString());

      // Get daily breakdown for sparkline
      const { data: dailyData } = await supabase
        .from('qr_scan_counts_daily')
        .select('scan_date, scan_count')
        .gte('scan_date', sevenDaysAgo.toISOString())
        .order('scan_date', { ascending: true });

      // Get device breakdown
      const { data: deviceData } = await supabase.rpc('get_device_breakdown', {
        p_qr_id: qrCodes[0]?.id || '',
        p_start_date: sevenDaysAgo.toISOString(),
      });

      const devices: Record<string, number> = {};
      if (Array.isArray(deviceData)) {
        deviceData.forEach((item: { device_type: string; count: string }) => {
          devices[item.device_type || 'unknown'] = parseInt(item.count);
        });
      }

      // Calculate trend percentage
      const current = currentWeekScans || 0;
      const previous = previousWeekScans || 0;
      const trendPercent = previous > 0 
        ? Math.round(((current - previous) / previous) * 100) 
        : current > 0 ? 100 : 0;

      return {
        totalScans: current,
        todayScans: todayScans || 0,
        trendPercent,
        isUp: trendPercent >= 0,
        dailyData: dailyData || [],
        devices,
      };
    },
    enabled: qrCodes.length > 0,
  });

  if (isLoading) {
    return <QRInsightsWidgetSkeleton />;
  }

  if (qrCodes.length === 0) {
    return (
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">QR Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <QrCode className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No active QR codes</p>
            <Link 
              to="/owner/management?tab=qrcodes"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Create your first QR code →
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = scanStats || { 
    totalScans: 0, 
    todayScans: 0, 
    trendPercent: 0, 
    isUp: true, 
    dailyData: [],
    devices: {} 
  };

  // Calculate max for sparkline scaling
  const maxScan = Math.max(...stats.dailyData.map((d: DailyScan) => d.scan_count || 0), 1);

  // Get device icon
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'desktop':
        return Monitor;
      case 'tablet':
        return Tablet;
      default:
        return Smartphone;
    }
  };

  // Get total device scans for percentage
  const totalDeviceScans = Object.values(stats.devices).reduce((a, b) => a + b, 0);

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden group">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">QR Insights</CardTitle>
          </div>
          <Link 
            to="/owner/management?tab=qrcodes"
            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            View all <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Main Stats Row */}
        <div className="grid grid-cols-2 divide-x divide-border/50">
          {/* Total Scans (7 days) */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Scan className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                7-Day Scans
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.totalScans}</span>
              <div className={cn(
                "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                stats.isUp 
                  ? "bg-emerald-500/10 text-emerald-600" 
                  : "bg-rose-500/10 text-rose-600"
              )}>
                {stats.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(stats.trendPercent)}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs previous week</p>
          </div>

          {/* Today's Scans */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Today
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.todayScans}</span>
              <span className="text-xs text-muted-foreground">scans</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMM d')}</p>
          </div>
        </div>

        {/* Sparkline Chart */}
        <div className="px-5 py-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">Last 7 days activity</span>
          </div>
          <div className="flex items-end gap-1 h-12">
            {stats.dailyData.length > 0 ? (
              stats.dailyData.map((day: DailyScan, i: number) => {
                const height = ((day.scan_count || 0) / maxScan) * 100;
                const isToday = i === stats.dailyData.length - 1;
                return (
                  <div 
                    key={day.scan_date} 
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div 
                      className={cn(
                        "w-full rounded-t-sm transition-all duration-300",
                        isToday 
                          ? "bg-primary" 
                          : "bg-primary/30 group-hover:bg-primary/50"
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {format(new Date(day.scan_date), 'EEE').charAt(0)}
                    </span>
                  </div>
                );
              })
            ) : (
              // Show empty state bars
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-1 rounded-t-sm bg-muted" />
                  <span className="text-[9px] text-muted-foreground">-</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        {Object.keys(stats.devices).length > 0 && (
          <div className="px-5 py-4 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground mb-3 block">
              Device breakdown
            </span>
            <div className="flex gap-3">
              {Object.entries(stats.devices).map(([device, count]) => {
                const Icon = getDeviceIcon(device);
                const percent = totalDeviceScans > 0 
                  ? Math.round((count / totalDeviceScans) * 100) 
                  : 0;
                return (
                  <div 
                    key={device}
                    className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{percent}%</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{device}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active QR Codes Footer */}
        <div className="px-5 py-3 border-t border-border/50 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {qrCodes.length} active QR code{qrCodes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Link 
            to="/owner/management?tab=qrcodes"
            className="text-xs font-medium text-primary hover:underline"
          >
            Manage →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function QRInsightsWidgetSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">QR Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border/50">
          <div className="p-5 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="p-5 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border/50">
          <div className="flex items-end gap-1 h-12">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex-1">
                <Skeleton 
                  className="w-full rounded-t-sm" 
                  style={{ height: `${20 + Math.random() * 60}%` }} 
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
