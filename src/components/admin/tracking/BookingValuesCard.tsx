
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingValuesCardProps {
  bookingValues: {
    average: number;
    total: number;
  };
}

export const BookingValuesCard = ({ bookingValues }: BookingValuesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Values</CardTitle>
        <CardDescription>Summary of booking financial metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600">Average Booking Value</div>
            <div className="text-2xl font-bold">{bookingValues.average.toFixed(2)} SAR</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Total Booking Value</div>
            <div className="text-2xl font-bold">{bookingValues.total.toFixed(2)} SAR</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
