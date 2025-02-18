
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeographicInsightsType } from './types';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GeographicInsightsProps {
  data: GeographicInsightsType;
}

export const GeographicInsights = ({ data }: GeographicInsightsProps) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Branch Locations & Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Map
              latitude={25}
              longitude={45}
              zoom={8}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            >
              {/* Heat map layer for customer density */}
              <Source
                type="geojson"
                data={{
                  type: 'FeatureCollection',
                  features: data.customerDensity.map(point => ({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: point.coordinates
                    },
                    properties: {
                      weight: point.weight
                    }
                  }))
                }}
              >
                <Layer
                  id="heat"
                  type="heatmap"
                  paint={{
                    'heatmap-weight': ['get', 'weight'],
                    'heatmap-intensity': 1,
                    'heatmap-color': [
                      'interpolate',
                      ['linear'],
                      ['heatmap-density'],
                      0, 'rgba(0,0,255,0)',
                      0.2, '#4ade80',
                      0.4, '#22c55e',
                      0.6, '#16a34a',
                      0.8, '#15803d',
                      1, '#166534'
                    ],
                    'heatmap-radius': 30
                  }}
                />
              </Source>

              {/* Branch location markers */}
              <Source
                type="geojson"
                data={{
                  type: 'FeatureCollection',
                  features: data.branchLocations.map(branch => ({
                    type: 'Feature',
                    geometry: {
                      type: 'Point',
                      coordinates: branch.coordinates
                    },
                    properties: {
                      name: branch.name,
                      performance: branch.performance
                    }
                  }))
                }}
              >
                <Layer
                  id="branches"
                  type="circle"
                  paint={{
                    'circle-radius': 8,
                    'circle-color': '#4ade80',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                  }}
                />
              </Source>
            </Map>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
