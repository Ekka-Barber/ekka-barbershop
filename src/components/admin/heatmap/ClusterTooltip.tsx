
import { format } from 'date-fns';
import { Cluster } from '@/types/heatmap';

interface ClusterTooltipProps {
  cluster: Cluster;
  style: React.CSSProperties;
}

export const ClusterTooltip = ({ cluster, style }: ClusterTooltipProps) => {
  return (
    <div
      className="fixed z-50 bg-white/90 backdrop-blur-sm border rounded-lg shadow-lg p-3 pointer-events-none"
      style={{
        ...style,
        minWidth: '200px',
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="text-sm font-medium">{cluster.points.length} clicks in this area</div>
      <div className="text-xs text-gray-500 mt-1">
        Device breakdown:
        <ul className="mt-1">
          {Object.entries(
            cluster.points.reduce((acc, point) => {
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
        Latest click: {format(new Date(cluster.points[cluster.points.length - 1].created_at), 'PP p')}
      </div>
    </div>
  );
};
