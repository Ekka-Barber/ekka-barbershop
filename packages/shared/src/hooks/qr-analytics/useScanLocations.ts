
import { supabase } from '@shared/lib/supabase/client';

interface QrScanLocation {
  location: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function fetchScanLocations(selectedQrId: string, startDate: Date) {
  let locationData: QrScanLocation[] = [];
  try {
    const { data, error } = await supabase
      .from('qr_scans')
      .select('location, latitude, longitude')
      .eq('qr_id', selectedQrId)
      .gte('scanned_at', startDate.toISOString());

    if (!error && data) {
      locationData = data.filter(
        (item) => item.latitude != null && item.longitude != null
      );
    }
  } catch {
    return [];
  }

  // Process location data
  const locationMap = new Map();
  if (Array.isArray(locationData)) {
    locationData.forEach((item) => {
      if (item.latitude && item.longitude) {
        const key = `${item.latitude},${item.longitude}`;
        if (locationMap.has(key)) {
          locationMap.set(key, locationMap.get(key) + 1);
        } else {
          locationMap.set(key, 1);
        }
      }
    });
  }

  return Array.from(locationMap.entries()).map(([key, count]) => {
    const [lat, lng] = key.split(',').map(Number);
    return { lat, lng, count };
  });
}
