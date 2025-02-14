
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
  scroll_x: number;
  scroll_y: number;
  content_width: number;
  content_height: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  page_url: string;
  created_at: string;
}

interface NormalizedClick {
  x: number;
  y: number;
  originalData: ClickData;
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
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0.8);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [currentPath, setCurrentPath] = useState('/customer');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe load and navigation
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return;

      // Update current path when navigation occurs
      const handleNavigation = () => {
        setCurrentPath(iframeWindow.location.pathname);
        updateHeatmap(iframeWindow.location.pathname);
      };

      // Listen for location changes in the iframe
      iframeWindow.addEventListener('popstate', handleNavigation);
      
      // Monitor click events in iframe for path changes
      iframeWindow.document.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'A') {
          setTimeout(handleNavigation, 100); // Small delay to let navigation complete
        }
      });

      handleNavigation(); // Initial load
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, []);

  // Update heatmap data for current path
  const updateHeatmap = async (path: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('click_tracking')
        .select('*')
        .eq('page_url', path);
      
      if (selectedDevice !== 'all') {
        query = query.eq('device_type', selectedDevice);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      setClickData(data || []);
    } catch (error) {
      console.error('Error fetching click data:', error);
      toast.error('Error loading heatmap data');
    } finally {
      setIsLoading(false);
    }
  };

  // Normalized click data with proper scaling and scroll position
  const normalizedClicks = useMemo(() => {
    if (!containerRef.current || !iframeRef.current) return [];

    const iframe = iframeRef.current;
    const { width: containerWidth, height: containerHeight } = iframe.getBoundingClientRect();

    return clickData.map(click => {
      // Ensure we have valid dimensions to prevent NaN
      const safeContentWidth = Math.max(click.content_width, containerWidth, 100);
      const safeContentHeight = Math.max(click.content_height, containerHeight, 100);

      // Calculate normalized coordinates with boundary checks
      const normalizedX = Math.min(
        containerWidth,
        Math.max(0, ((click.x_coordinate - click.scroll_x) / safeContentWidth) * containerWidth)
      );
      const normalizedY = Math.min(
        containerHeight,
        Math.max(0, ((click.y_coordinate - click.scroll_y) / safeContentHeight) * containerHeight)
      );

      return {
        x: isFinite(normalizedX) ? normalizedX : 0,
        y: isFinite(normalizedY) ? normalizedY : 0,
        originalData: click
      };
    });
  }, [clickData]);

  // Cluster data processing
  const clusters = useMemo(() => {
    const CLUSTER_RADIUS = 30 / zoomLevel;
    const clusters: Cluster[] = [];

    normalizedClicks.forEach((normalizedClick) => {
      let addedToCluster = false;
      
      for (const cluster of clusters) {
        const dx = cluster.centerX - normalizedClick.x;
        const dy = cluster.centerY - normalizedClick.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= CLUSTER_RADIUS) {
          cluster.points.push(normalizedClick.originalData);
          // Update cluster center as average of all points
          const totalPoints = cluster.points.length;
          cluster.centerX = (cluster.centerX * (totalPoints - 1) + normalizedClick.x) / totalPoints;
          cluster.centerY = (cluster.centerY * (totalPoints - 1) + normalizedClick.y) / totalPoints;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          centerX: normalizedClick.x,
          centerY: normalizedClick.y,
          points: [normalizedClick.originalData]
        });
      }
    });

    return clusters;
  }, [normalizedClicks, zoomLevel]);

  // Draw heatmap
  useEffect(() => {
    if (!canvasRef.current || !iframeRef.current) return;

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
      // Ensure coordinates are finite numbers
      if (!isFinite(cluster.centerX) || !isFinite(cluster.centerY)) return;

      const intensity = Math.min(1, cluster.points.length / 20);
      const radius = Math.max(20, 10 + cluster.points.length * 2) / zoomLevel;
      
      try {
        const gradient = ctx.createRadialGradient(
          cluster.centerX,
          cluster.centerY,
          0,
          cluster.centerX,
          cluster.centerY,
          radius
        );

        const color = interpolateColors(intensity);
        
        gradient.addColorStop(0, `rgba(${color.join(',')}, ${opacity})`);
        gradient.addColorStop(1, `rgba(${color.join(',')}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cluster.centerX, cluster.centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
      } catch (error) {
        console.error('Error drawing cluster:', error);
      }
    });

    ctx.restore();
  }, [clusters, opacity, zoomLevel]);

  // Canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !iframeRef.current) return;
      
      const { width, height } = iframeRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
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

  // Color interpolation helpers
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
          <Select value={selectedDevice} onValueChange={(value) => setSelectedDevice(value as DeviceType)}>
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
        <iframe
          ref={iframeRef}
          src="/customer"
          className="absolute inset-0 w-full h-full border-none"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCluster(null)}
          className="absolute inset-0 pointer-events-none"
          style={{ 
            cursor: hoveredCluster ? 'pointer' : 'default',
            backgroundColor: 'transparent'
          }}
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
