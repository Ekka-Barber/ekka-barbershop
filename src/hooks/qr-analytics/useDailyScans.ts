
import { getSupabaseClient } from '@/services/supabaseService';

export async function fetchDailyScans(selectedQrId: string, startDate: Date, endDate: Date) {
  const supabase = await getSupabaseClient();
  const { data: dailyScanData, error: dailyError } = await supabase
    .from('qr_scan_counts_daily')
    .select('*')
    .eq('qr_id', selectedQrId)
    .gte('scan_date', startDate.toISOString())
    .lte('scan_date', endDate.toISOString())
    .order('scan_date');
    
  if (dailyError) throw dailyError;
  
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
  
  return filledDailyScans;
}

export async function fetchTotalScanCount(selectedQrId: string, startDate: Date) {
  const supabase = await getSupabaseClient();
  const { count: scanCount, error: countError } = await supabase
    .from('qr_scans')
    .select('*', { count: 'exact', head: true })
    .eq('qr_id', selectedQrId)
    .gte('scanned_at', startDate.toISOString());
    
  if (countError) throw countError;
  
  return scanCount || 0;
}
