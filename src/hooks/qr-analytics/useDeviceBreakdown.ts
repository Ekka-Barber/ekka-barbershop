import { supabase } from "@/integrations/supabase/client";

export async function fetchDeviceBreakdown(selectedQrId: string, startDate: Date) {
  const { data: deviceData, error: deviceError } = await supabase.rpc(
    'get_device_breakdown',
    { 
      p_qr_id: selectedQrId,
      p_start_date: startDate.toISOString()
    }
  );
    
  if (deviceError) throw deviceError;
  
  // Process data for device breakdown
  const deviceBreakdown: Record<string, number> = {};
  if (Array.isArray(deviceData)) {
    deviceData.forEach((item: {device_type: string, count: string}) => {
      const deviceType = item.device_type || 'unknown';
      deviceBreakdown[deviceType] = parseInt(item.count);
    });
  }
  
  return deviceBreakdown;
}

export async function fetchReferrerBreakdown(selectedQrId: string, startDate: Date) {
  const { data: referrerData, error: referrerError } = await supabase.rpc(
    'get_referrer_breakdown',
    { 
      p_qr_id: selectedQrId,
      p_start_date: startDate.toISOString()
    }
  );
    
  if (referrerError) throw referrerError;
  
  const referrerBreakdown: Record<string, number> = {};
  if (Array.isArray(referrerData)) {
    referrerData.forEach((item: {referrer: string, count: string}) => {
      // Process referrer to get a readable hostname
      let referrer = item.referrer || 'Direct';
      try {
        if (referrer !== 'Direct' && referrer.startsWith('http')) {
          referrer = new URL(referrer).hostname;
        }
      } catch {
        // Keep original referrer if URL parsing fails
      }
      referrerBreakdown[referrer] = parseInt(item.count);
    });
  }
  
  return referrerBreakdown;
}
