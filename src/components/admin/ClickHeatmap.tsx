
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import h337 from 'heatmap.js';

interface ClickData {
  x_coordinate: number;
  y_coordinate: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  page_url: string;
}

export const ClickHeatmap = () => {
  const [selectedPage, setSelectedPage] = useState<string>('/customer');
  const [selectedDevice, setSelectedDevice] = useState<'all' | 'mobile' | 'tablet' | 'desktop'>('all');
  const [pages, setPages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapInstance = useRef<any>(null);

  // Fetch unique pages
  useEffect(() => {
    const fetchPages = async () => {
      const { data } = await supabase
        .from('click_tracking')
        .select('page_url')
        .eq('page_url', 'page_url');
      
      if (data) {
        const uniquePages = [...new Set(data.map(item => item.page_url))];
        setPages(uniquePages);
      }
    };
    
    fetchPages();
  }, []);

  // Initialize heatmap
  useEffect(() => {
    if (containerRef.current && !heatmapInstance.current) {
      heatmapInstance.current = h337.create({
        container: containerRef.current,
        radius: 25,
        maxOpacity: .6,
        minOpacity: 0,
        blur: .75
      });
    }
  }, []);

  // Update heatmap data
  useEffect(() => {
    const fetchClicks = async () => {
      let query = supabase
        .from('click_tracking')
        .select('x_coordinate, y_coordinate, device_type')
        .eq('page_url', selectedPage);
      
      if (selectedDevice !== 'all') {
        query = query.eq('device_type', selectedDevice as 'mobile' | 'tablet' | 'desktop');
      }
      
      const { data } = await query;
      
      if (data && heatmapInstance.current) {
        const points = data.map(click => ({
          x: click.x_coordinate,
          y: click.y_coordinate,
          value: 1
        }));
        
        heatmapInstance.current.setData({
          max: points.length,
          data: points
        });
      }
    };
    
    fetchClicks();
  }, [selectedPage, selectedDevice]);

  return (
    <Card className="p-6">
      <div className="mb-6 flex gap-4">
        <Select value={selectedPage} onValueChange={setSelectedPage}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select page" />
          </SelectTrigger>
          <SelectContent>
            {pages.map(page => (
              <SelectItem key={page} value={page}>
                {page}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select device" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-[600px] relative bg-white border rounded-lg"
      />
    </Card>
  );
};
