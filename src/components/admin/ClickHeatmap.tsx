
import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";
import { format } from 'date-fns';

interface ClickData {
  x_coordinate: number;
  y_coordinate: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  page_url: string;
  created_at: string;
}

interface Cluster {
  centerX: number;
  centerY: number;
  points: ClickData[];
}

type DeviceType = 'all' | 'mobile' | 'tablet' | 'desktop';

const COLORS = {
  low: [211, 228, 253],    // Soft Blue
  medium: [14, 165, 233],  // Ocean Blue
  high: [217, 70, 239],    // Magenta Pink
  max: [139, 92, 246]      // Vivid Purple
};

export const ClickHeatmap = () => {
  const [selectedPage, setSelectedPage] = useState<string>('/customer');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('all');
  const [pages, setPages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0.8);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Fetch pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const { data, error } = await supabase
          .from('click_tracking')
          .select('page_url');
        
        if (error) throw error;
        
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

  // Cluster data processing
  const clusters = useMemo(() => {
    const CLUSTER_RADIUS = 30 / zoomLevel;
    const clusters: Cluster[] = [];

    clickData.forEach((point) => {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const dx = cluster.centerX - point.x_coordinate;
        const dy = cluster.centerY - point.y_coordinate;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= CLUSTER_RADIUS) {
          cluster.points.push(point);
          cluster.centerX = cluster.points.reduce((sum, p) => sum + p.x_coordinate, 0) / cluster.points.length;
          cluster.centerY = cluster.points.reduce((sum, p) => sum + p.y_coordinate, 0) / cluster.points.length;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          centerX: point.x_coordinate,
          centerY: point.y_coordinate,
          points: [point]
        });
      }
    });

    return clusters;
  }, [clickData, zoomLevel]);

  // Draw heatmap
  useEffect(() => {
    const drawHeatmap = async () => {
      if (!containerRef.current || !canvasRef.current) return;

      setIsLoading(true);
      try {
        let query = supabase
          .from('click_tracking')
          .select('x_coordinate, y_coordinate, device_type, created_at, page_url')  // Added page_url to select
          .eq('page_url', selectedPage);
        
        if (selectedDevice !== 'all') {
          query = query.eq('device_type', selectedDevice);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;

        setClickData(data || []);
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply zoom transformation
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);

        // Draw clusters
        clusters.forEach((cluster) => {
          const intensity = Math.min(1, cluster.points.length / 20);
          const radius = Math.max(20, 10 + cluster.points.length * 2) / zoomLevel;
          
          // Create gradient
          const gradient = ctx.createRadialGradient(
            cluster.centerX, cluster.centerY, 0,
            cluster.centerX, cluster.centerY, radius
          );

          // Calculate color based on intensity
          const color = interpolateColors(intensity);
          
          gradient.addColorStop(0, `rgba(${color.join(',')}, ${opacity})`);
          gradient.addColorStop(1, `rgba(${color.join(',')}, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(cluster.centerX, cluster.centerY, radius, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.restore();

      } catch (error) {
        console.error('Error creating heatmap:', error);
        toast.error('Error creating heatmap');
      } finally {
        setIsLoading(false);
      }
    };

    drawHeatmap();
  }, [selectedPage, selectedDevice, opacity, zoomLevel, clusters]);

  // Canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !tooltipRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    // Find nearest cluster
    let nearestCluster: Cluster | null = null;
    let minDistance = Infinity;

    clusters.forEach((cluster) => {
      const dx = cluster.centerX - x;
      const dy = cluster.centerY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance && distance < 50) {
        minDistance = distance;
        nearestCluster = cluster;
      }
    });

    setHoveredCluster(nearestCluster);

    if (nearestCluster && tooltipRef.current) {
      tooltipRef.current.style.left = `${e.clientX + 10}px`;
      tooltipRef.current.style.top = `${e.clientY + 10}px`;
    }
  };

  const handleDeviceChange = (value: string) => {
    setSelectedDevice(value as DeviceType);
  };

  // Color interpolation helper
  const interpolateColors = (intensity: number): number[] => {
    if (intensity <= 0.33) {
      return interpolate(COLORS.low, COLORS.medium, intensity * 3);
    } else if (intensity <= 0.66) {
      return interpolate(COLORS.medium, COLORS.high, (intensity - 0.33) * 3);
    } else {
      return interpolate(COLORS.high, COLORS.max, (intensity - 0.66) * 3);
    }
  };

  const interpolate = (color1: number[], color2: number[], factor: number): number[] => {
    return color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
  };

  return (
    <Card className="p-6">
      <div className={`mb-6 space-y-4 ${showUI ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <div className="flex gap-4">
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

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Opacity</label>
            <Slider
              value={[opacity * 100]}
              onValueChange={(value) => setOpacity(value[0] / 100)}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowUI(prev => !prev)}
            >
              {showUI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="w-full h-[600px] relative bg-white border rounded-lg overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCluster(null)}
          className="absolute inset-0"
          style={{ cursor: hoveredCluster ? 'pointer' : 'default' }}
        />
        {hoveredCluster && (
          <div
            ref={tooltipRef}
            className="fixed z-50 bg-white/90 backdrop-blur-sm border rounded-lg shadow-lg p-3 pointer-events-none"
            style={{
              minWidth: '200px',
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-sm font-medium">{hoveredCluster.points.length} clicks in this area</div>
            <div className="text-xs text-gray-500 mt-1">
              Device breakdown:
              <ul className="mt-1">
                {Object.entries(
                  hoveredCluster.points.reduce((acc, point) => {
                    acc[point.device_type] = (acc[point.device_type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([device, count]) => (
                  <li key={device}>
                    {device}: {count} clicks
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Latest click: {format(new Date(hoveredCluster.points[hoveredCluster.points.length - 1].created_at), 'PP p')}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
    </Card>
  );
};
