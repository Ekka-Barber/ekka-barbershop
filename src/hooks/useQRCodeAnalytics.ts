import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QRCode } from '@/types/admin';

export interface QRScanData {
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

export function useQRCodeAnalytics(qrCodes: QRCode[]) {
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
      
      // Fetch device breakdown using RPC
      const { data: deviceData, error: deviceError } = await supabase.rpc(
        'get_device_breakdown',
        { 
          p_qr_id: selectedQrId,
          p_start_date: startDate.toISOString()
        }
      );
        
      if (deviceError) throw deviceError;
      
      // Fetch referrer breakdown using RPC
      const { data: referrerData, error: referrerError } = await supabase.rpc(
        'get_referrer_breakdown',
        { 
          p_qr_id: selectedQrId,
          p_start_date: startDate.toISOString()
        }
      );
        
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
      if (Array.isArray(deviceData)) {
        deviceData.forEach((item: {device_type: string, count: string}) => {
          const deviceType = item.device_type || 'unknown';
          deviceBreakdown[deviceType] = parseInt(item.count);
        });
      }
      
      const referrerBreakdown: Record<string, number> = {};
      if (Array.isArray(referrerData)) {
        referrerData.forEach((item: {referrer: string, count: string}) => {
          // Process referrer to get a readable hostname
          let referrer = item.referrer || 'Direct';
          try {
            if (referrer !== 'Direct' && referrer.startsWith('http')) {
              referrer = new URL(referrer).hostname;
            }
          } catch (e) {
            // Keep original referrer if URL parsing fails
          }
          referrerBreakdown[referrer] = parseInt(item.count);
        });
      }
      
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

  return {
    selectedQrId,
    setSelectedQrId,
    timeRange,
    setTimeRange,
    analyticsData,
    isLoading
  };
}
