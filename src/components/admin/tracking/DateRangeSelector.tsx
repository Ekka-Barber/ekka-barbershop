
import { CalendarDateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays } from "date-fns";
import { useState } from "react";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
}

export const DateRangeSelector = ({ onRangeChange }: DateRangeSelectorProps) => {
  const [date, setDate] = useState<DateRange>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handleDateChange = (range: DateRange) => {
    setDate(range);
    onRangeChange(range);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date Range</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarDateRangePicker date={date} setDate={handleDateChange} />
      </CardContent>
    </Card>
  );
};
