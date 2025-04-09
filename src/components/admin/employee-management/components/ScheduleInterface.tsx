
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useScheduleManager } from '../hooks/useScheduleManager';
import { ScheduleHeader } from './schedule/ScheduleHeader';
import { WeekScheduleGrid } from './schedule/WeekScheduleGrid';
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
    viewMode,
    workSchedule,
    isUpdating,
    daysOfWeek,
    setViewMode,
    handleEmployeeSelect,
    updateSchedule,
    updateDaySchedule
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
          viewMode={viewMode}
          onEmployeeSelect={handleEmployeeSelect}
          onViewModeChange={setViewMode}
          selectedBranch={selectedBranch}
        />
        
        {selectedEmployee ? (
          <>
            <WeekScheduleGrid
              daysOfWeek={daysOfWeek}
              workSchedule={workSchedule}
              onDayScheduleChange={updateDaySchedule}
            />
            
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
