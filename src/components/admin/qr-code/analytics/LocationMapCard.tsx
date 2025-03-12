
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Initialize map if window.mapboxgl is available and there's a container
    if (!mapContainerRef.current || !window.mapboxgl) return;

    // Only initialize the map once
    if (!mapRef.current) {
      window.mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNrZHBzZGFxdjE4bnEycm85eHZwcmI2NWsifQ.dPThlm1y0XgXgRpR2XVDmQ';
      
      mapRef.current = new window.mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20], // Center on world view
        zoom: 1
      });

      // Add navigation controls
      mapRef.current.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for scan locations
    if (scanLocations.length > 0) {
      // Calculate bounds to fit all markers
      const bounds = new window.mapboxgl.LngLatBounds();
      
      scanLocations.forEach(location => {
        // Create a marker for each location
        const marker = new window.mapboxgl.Marker()
          .setLngLat([location.lng, location.lat])
          .setPopup(new window.mapboxgl.Popup().setHTML(`<p>Scans: ${location.count}</p>`))
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

    return () => {
      // Cleanup function for component unmount
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
      }
    };
  }, [scanLocations]);

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
          <div className="h-[300px] rounded-md overflow-hidden" ref={mapContainerRef} />
        ) : (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground">
            No location data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
