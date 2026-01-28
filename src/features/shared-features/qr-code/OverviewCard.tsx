
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@shared/ui/components/card";

interface OverviewCardProps {
  scanCount: number;
  avgDailyScans: number;
  dailyScans: {
    date: string;
    count: number;
  }[];
}

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
};

const getMaxDailyCount = (dailyScans: OverviewCardProps['dailyScans']) => {
  return dailyScans.reduce((max, entry) => Math.max(max, entry.count), 0) || 1;
};

export const OverviewCard = ({ scanCount, avgDailyScans, dailyScans }: OverviewCardProps) => {
  const maxCount = getMaxDailyCount(dailyScans);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Overview</CardTitle>
        <CardDescription>Summary of QR code performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Daily Scan History</h3>
              <span className="text-xs text-muted-foreground">
                {dailyScans.length ? `${dailyScans.length} days` : 'No history yet'}
              </span>
            </div>
            {dailyScans.length ? (
              <div className="space-y-3">
                {dailyScans.map((entry) => {
                  const barWidth = Math.min(100, (entry.count / maxCount) * 100);
                  return (
                    <div key={entry.date} className="flex items-center gap-3">
                      <span className="min-w-[64px] text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-primary transition-all duration-150"
                          style={{ width: `${Math.max(barWidth, 4)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{entry.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Scans are still being collected. Check back once users interact with your QR codes.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
