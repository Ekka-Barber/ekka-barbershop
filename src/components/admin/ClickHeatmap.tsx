import { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ClickData, Cluster, DeviceType } from '@/types/heatmap';
import { HEATMAP_COLORS, interpolateColors, normalizeCoordinates } from '@/utils/heatmapUtils';
import { HeatmapControls } from './heatmap/HeatmapControls';
import { ClusterTooltip } from './heatmap/ClusterTooltip';

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

    return clickData.map(click => ({
      ...normalizeCoordinates(click, containerWidth, containerHeight),
      originalData: click
    }));
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

        const color = interpolateColors(intensity, HEATMAP_COLORS);
        
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

  return (
    <Card className="p-6">
      <HeatmapControls
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        opacity={opacity}
        setOpacity={setOpacity}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        showUI={showUI}
        setShowUI={setShowUI}
      />

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
          <ClusterTooltip
            cluster={hoveredCluster}
            style={{
              left: tooltipRef.current?.style.left,
              top: tooltipRef.current?.style.top
            }}
          />
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
