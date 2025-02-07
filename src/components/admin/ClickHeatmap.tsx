
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import h337 from 'heatmap.js';
import { toast } from "sonner";

interface ClickData {
  x_coordinate: number;
  y_coordinate: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  page_url: string;
}

type DeviceType = 'all' | 'mobile' | 'tablet' | 'desktop';

export const ClickHeatmap = () => {
  const [selectedPage, setSelectedPage] = useState<string>('/customer');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('all');
  const [pages, setPages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapInstanceRef = useRef<any>(null);

  // Fetch unique pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('click_tracking')
          .select('page_url');
        
        if (error) {
          console.error('Error fetching pages:', error);
          toast.error('Error fetching pages');
          return;
        }
        
        if (data) {
          const uniquePages = [...new Set(data.map(item => item.page_url))];
          setPages(uniquePages);
          console.log('Unique pages:', uniquePages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('Error fetching pages');
      }
    };
    
    fetchPages();
  }, []);

  // Initialize heatmap
  useEffect(() => {
    if (containerRef.current && !heatmapInstanceRef.current) {
      heatmapInstanceRef.current = h337.create({
        container: containerRef.current,
        radius: 25,
        maxOpacity: .6,
        minOpacity: 0,
        blur: .75
      });
    }

    return () => {
      if (heatmapInstanceRef.current) {
        // Clean up the heatmap instance
        heatmapInstanceRef.current = null;
      }
    };
  }, []);

  // Update heatmap data
  useEffect(() => {
    const fetchClicks = async () => {
      if (!heatmapInstanceRef.current) return;

      try {
        console.log('Fetching clicks for:', { selectedPage, selectedDevice });
        
        let query = supabase
          .from('click_tracking')
          .select('x_coordinate, y_coordinate, device_type')
          .eq('page_url', selectedPage);
        
        if (selectedDevice !== 'all') {
          query = query.eq('device_type', selectedDevice);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching clicks:', error);
          toast.error('Error fetching click data');
          return;
        }
        
        console.log('Click data:', data);
        
        if (data) {
          // Create a new data object for the heatmap
          const heatmapData = {
            max: Math.max(1, data.length),
            min: 0,
            data: data.map(click => ({
              x: click.x_coordinate,
              y: click.y_coordinate,
              value: 1
            }))
          };

          // Clear existing data
          heatmapInstanceRef.current.setData({ max: 0, min: 0, data: [] });
          
          // Set new data
          requestAnimationFrame(() => {
            if (heatmapInstanceRef.current) {
              heatmapInstanceRef.current.setData(heatmapData);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching clicks:', error);
        toast.error('Error fetching click data');
      }
    };
    
    fetchClicks();
  }, [selectedPage, selectedDevice]);

  const handleDeviceChange = (value: string) => {
    setSelectedDevice(value as DeviceType);
  };

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

        <Select value={selectedDevice} onValueChange={handleDeviceChange}>
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
