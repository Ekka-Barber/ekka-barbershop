
import { supabase } from "@shared/lib/supabase/client";

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
        item => item.latitude != null && item.longitude != null
      );
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    // Continue even if location data fails
  }

  // Process location data
  const locationMap = new Map();
  try {
    if (Array.isArray(locationData)) {
      locationData.forEach(item => {
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
  } catch (e) {
    console.error('Error processing location data:', e);
  }

  return Array.from(locationMap.entries()).map(([key, count]) => {
    const [lat, lng] = key.split(',').map(Number);
    return { lat, lng, count };
  });
}
