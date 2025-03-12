
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LocationData {
  lat: number;
  lng: number;
  count: number;
}

interface LocationMapCardProps {
  scanLocations: LocationData[];
  isLoading: boolean;
}

export const LocationMapCard = ({ scanLocations, isLoading }: LocationMapCardProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxLoading, setMapboxLoading] = useState(false);

  // Lazy load Mapbox only when needed
  const loadMapbox = async () => {
    if (typeof window === 'undefined' || !scanLocations.length || mapLoaded || mapboxLoading) return;
    
    try {
      setMapboxLoading(true);
      
      // Dynamically import mapboxgl
      const mapboxgl = (await import('mapbox-gl')).default;
      
      // Also import the CSS
      await import('mapbox-gl/dist/mapbox-gl.css');
      
      // Initialize map
      mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNrZHBzZGFxdjE4bnEycm85eHZwcmI2NWsifQ.dPThlm1y0XgXgRpR2XVDmQ';
      
      if (mapContainerRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [0, 20], // Center on world view
          zoom: 1
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Add markers after map loads
        mapRef.current.on('load', () => {
          addMarkers(mapboxgl);
          setMapLoaded(true);
        });
      }
    } catch (error) {
      console.error('Error loading Mapbox:', error);
    } finally {
      setMapboxLoading(false);
    }
  };

  // Add markers to the map
  const addMarkers = async (mapboxgl: any) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (scanLocations.length > 0 && mapRef.current) {
      // Calculate bounds to fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      
      scanLocations.forEach(location => {
        // Create a marker for each location
        const marker = new mapboxgl.Marker()
          .setLngLat([location.lng, location.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`<p>Scans: ${location.count}</p>`))
          .addTo(mapRef.current);
        
        markersRef.current.push(marker);
        bounds.extend([location.lng, location.lat]);
      });

      // Fit map to include all markers with padding
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  };

  // Intersection Observer to load map when component is visible
  useEffect(() => {
    if (!scanLocations.length || isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMapbox();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (mapContainerRef.current) {
      observer.observe(mapContainerRef.current);
    }
    
    return () => {
      observer.disconnect();
    };
  }, [scanLocations, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle>Scan Locations</CardTitle>
        <CardDescription>Geographic distribution of QR code scans</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : scanLocations.length > 0 ? (
          <div className="h-[300px] rounded-md overflow-hidden" ref={mapContainerRef}>
            {mapboxLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No location data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

