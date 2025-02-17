
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceTracking } from "./types";

interface RecentActivityCardProps {
  serviceTracking: ServiceTracking[];
}

export const RecentActivityCard = ({ serviceTracking }: RecentActivityCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest service selection and booking step activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serviceTracking.slice(0, 10).map((track, index) => (
            <div key={index} className="flex justify-between items-center border-b pb-2 rtl">
              <div>
                <span className={track.action === 'added' ? 'text-green-600' : 'text-red-600'}>
                  {track.action === 'added' ? 'Added' : 'Removed'}
                </span>
                {' '}{track.service_name}
              </div>
              <div className="text-sm text-gray-500">
                {format(new Date(track.timestamp), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
