
import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('Error fetching pages');
      }
    };
    
    fetchPages();
  }, []);

  useEffect(() => {
    const drawHeatmap = async () => {
      if (!containerRef.current || !canvasRef.current) return;

      setIsLoading(true);
      try {
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

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the heatmap manually
        data.forEach((click) => {
          const radius = 20;
          const alpha = 0.1;

          // Create a radial gradient for each click
          const gradient = ctx.createRadialGradient(
            click.x_coordinate, click.y_coordinate, 0,
            click.x_coordinate, click.y_coordinate, radius
          );

          gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
          gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(click.x_coordinate, click.y_coordinate, radius, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Overlay the accumulation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        // Enhance the visualization by accumulating overlapping points
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const alpha = pixels[i + 3];
          
          if (alpha > 0) {
            // Increase opacity where points overlap
            pixels[i + 3] = Math.min(255, alpha * 2);
          }
        }

        ctx.putImageData(imageData, 0, 0);

      } catch (error) {
        console.error('Error creating heatmap:', error);
        toast.error('Error creating heatmap');
      } finally {
        setIsLoading(false);
      }
    };

    drawHeatmap();
  }, [selectedPage, selectedDevice]);

  useEffect(() => {
    if (containerRef.current && canvasRef.current) {
      // Set canvas size to match container
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, []);

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
        className="w-full h-[600px] relative bg-white border rounded-lg overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </Card>
  );
};
