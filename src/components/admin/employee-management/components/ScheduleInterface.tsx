import React from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useScheduleManager } from '../hooks/useScheduleManager';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { DayScheduleGrid } from './schedule/DayScheduleGrid';
import { ScheduleActions } from './schedule/ScheduleActions';
import { NoEmployeeSelected } from './schedule/NoEmployeeSelected';

interface ScheduleInterfaceProps {
  employees: Employee[];
  selectedBranch: string | null;
  onScheduleUpdate?: () => void;
}

export const ScheduleInterface = ({ 
  employees,
  selectedBranch,
  onScheduleUpdate
}: ScheduleInterfaceProps) => {
  const {
    selectedEmployee,
    isUpdating,
    daysOfWeek,
    handleEmployeeSelect,
    updateSchedule,
    updateDaySchedule,
    isDayWorking,
    getDayTimeRanges
  } = useScheduleManager(onScheduleUpdate);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Employee Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ScheduleHeader
          employees={employees}
          selectedEmployee={selectedEmployee}
          onEmployeeSelect={handleEmployeeSelect}
          selectedBranch={selectedBranch}
        />
        
        {selectedEmployee ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {daysOfWeek.map(day => (
                <DayScheduleGrid
                  key={day.key}
                  day={day}
                  timeRanges={getDayTimeRanges(day.key)}
                  isWorkingDay={isDayWorking(day.key)}
                  onDayScheduleChange={updateDaySchedule}
                />
              ))}
            </div>
            
            <ScheduleActions
              onSave={updateSchedule}
              isUpdating={isUpdating}
            />
          </>
        ) : (
          <NoEmployeeSelected />
        )}
      </CardContent>
    </Card>
  );
};
