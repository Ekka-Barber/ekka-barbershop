import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

interface ChartData {
  name: string;
  value: number;
}

interface ChartsBundleProps {
  children: React.ReactNode;
}

export const ChartsBundle: React.FC<ChartsBundleProps> = ({ children }) => {
  return <>{children}</>;
};

interface OverviewCardChartsProps {
  scanCount: number;
  avgDailyScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
}

// Export individual chart components for use in OverviewCard
export const OverviewCardCharts: React.FC<OverviewCardChartsProps> = ({
  scanCount,
  avgDailyScans,
  dailyScans
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <p className="text-3xl font-bold">{scanCount}</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Avg. Daily</p>
          <p className="text-3xl font-bold">{avgDailyScans}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium mb-2">Daily Scans</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyScans}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface BreakdownCardChartsProps {
  deviceData: ChartData[];
  referrerData: ChartData[];
}

export const BreakdownCardCharts: React.FC<BreakdownCardChartsProps> = ({
  deviceData,
  referrerData
}) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Device Types</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={deviceData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {deviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2 text-center">Traffic Sources</h3>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie
              data={referrerData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {referrerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
