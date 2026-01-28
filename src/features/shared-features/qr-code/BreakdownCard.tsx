
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@shared/ui/components/card";

interface ChartData {
  name: string;
  value: number;
}

interface BreakdownCardProps {
  deviceData: ChartData[];
  referrerData: ChartData[];
}

const renderList = (title: string, data: ChartData[]) => {
  const maxValue = data.reduce((max, entry) => Math.max(max, entry.value), 0) || 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {data.length ? `${data.length} entries` : 'No data yet'}
        </span>
      </div>
      {data.length ? (
        <div className="space-y-3">
          {data.map((entry) => {
            const widthPct = Math.min(100, (entry.value / maxValue) * 100);
            return (
              <div key={entry.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{entry.name}</span>
                  <span className="font-semibold text-slate-900">{entry.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary transition-all duration-150"
                    style={{ width: `${Math.max(widthPct, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          This data will appear once scanners interact with your links.
        </p>
      )}
    </div>
  );
};

export const BreakdownCard = ({ deviceData, referrerData }: BreakdownCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Breakdown</CardTitle>
        <CardDescription>Where and how your QR code is being scanned</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
          {renderList('Device Types', deviceData)}
          {renderList('Traffic Sources', referrerData)}
        </div>
      </CardContent>
    </Card>
  );
};
