
import { supabase } from "@/integrations/supabase/client";

export async function fetchRecentScans(selectedQrId: string) {
  const { data: recentScans, error: recentError } = await supabase
    .from('qr_scans')
    .select('scanned_at, device_type, referrer, location')
    .eq('qr_id', selectedQrId)
    .order('scanned_at', { ascending: false })
    .limit(5);
    
  if (recentError) throw recentError;
  
  return recentScans || [];
}
