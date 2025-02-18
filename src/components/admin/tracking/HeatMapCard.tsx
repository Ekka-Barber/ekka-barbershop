
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";
import heatmap from "heatmap.js";

interface ClickData {
  x_coordinate: number;
  y_coordinate: number;
  screen_width: number;
  screen_height: number;
  count: number;
}

export const HeatMapCard = ({ pageUrl }: { pageUrl: string }) => {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const heatmapInstance = useRef<any>(null);

  const { data: clickData } = useQuery({
    queryKey: ['click-heatmap', pageUrl],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('click_tracking')
        .select('x_coordinate, y_coordinate, screen_width, screen_height')
        .eq('page_url', pageUrl);
      
      if (error) throw error;
      
      // Normalize and aggregate click data
      const clickMap = new Map<string, ClickData>();
      data.forEach(click => {
        const key = `${click.x_coordinate}-${click.y_coordinate}`;
        const existing = clickMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          clickMap.set(key, {
            ...click,
            count: 1
          });
        }
      });
      
      return Array.from(clickMap.values());
    }
  });

  useEffect(() => {
    if (heatmapRef.current && clickData) {
      if (!heatmapInstance.current) {
        heatmapInstance.current = heatmap.create({
          container: heatmapRef.current,
          radius: 40,
          maxOpacity: 0.6,
          minOpacity: 0,
          blur: 0.75
        });
      }

      const points = clickData.map(click => ({
        x: click.x_coordinate,
        y: click.y_coordinate,
        value: click.count
      }));

      heatmapInstance.current.setData({
        max: Math.max(...clickData.map(d => d.count)),
        data: points
      });
    }
  }, [clickData]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Click Heat Map</CardTitle>
        <CardDescription>Visualization of user click patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={heatmapRef} className="w-full h-[500px] relative">
          {/* Heatmap will be rendered here */}
        </div>
      </CardContent>
    </Card>
  );
};
