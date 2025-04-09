
import { DaySchedule } from './DaySchedule';

interface WeekScheduleGridProps {
  daysOfWeek: Array<{
    key: string;
    label: string;
  }>;
  workSchedule: Record<string, {
    isWorkingDay: boolean;
    startTime: string;
    endTime: string;
  }>;
  onDayScheduleChange: (day: string, key: string, value: boolean | string) => void;
}

export const WeekScheduleGrid = ({
  daysOfWeek,
  workSchedule,
  onDayScheduleChange
}: WeekScheduleGridProps) => {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {daysOfWeek.map(day => (
          <DaySchedule 
            key={day.key}
            day={day}
            schedule={workSchedule[day.key] || { isWorkingDay: false, startTime: '09:00', endTime: '17:00' }}
            onScheduleChange={onDayScheduleChange}
          />
        ))}
      </div>
    </div>
  );
};
