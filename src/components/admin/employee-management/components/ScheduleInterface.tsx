import { useState } from 'react';
import { Employee } from '@/types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePickerInput } from '../../../../components/ui/time-picker-input';

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
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [workSchedule, setWorkSchedule] = useState<Record<string, { isWorkingDay: boolean; startTime: string; endTime: string }>>({});

  // Days of the week
  const daysOfWeek = [
    { key: 'sunday', label: 'Sun' },
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' }
  ];

  // Filter employees by selected branch
  const filteredEmployees = employees.filter(employee => 
    !selectedBranch || employee.branch_id === selectedBranch
  );

  // Fetch employee schedule when an employee is selected
  const fetchEmployeeSchedule = async (employeeId: string) => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('employees')
        .select('working_hours, off_days')
        .eq('id', employeeId)
        .single();

      if (error) throw error;

      // Initialize schedule based on employee data
      const newSchedule: Record<string, { isWorkingDay: boolean; startTime: string; endTime: string }> = {};
      
      // Default times
      const defaultStart = '09:00';
      const defaultEnd = '17:00';
      
      // Initialize all days with default values
      daysOfWeek.forEach(day => {
        newSchedule[day.key] = {
          isWorkingDay: true,
          startTime: defaultStart,
          endTime: defaultEnd
        };
      });
      
      // Update from working_hours if they exist
      if (data.working_hours) {
        const workingHours = typeof data.working_hours === 'string' 
          ? JSON.parse(data.working_hours) 
          : data.working_hours;
          
        Object.entries(workingHours).forEach(([day, hours]: [string, unknown]) => {
          if (hours) {
            // Handle different formats of working hours
            if (Array.isArray(hours) && hours.length >= 2) {
              newSchedule[day] = {
                isWorkingDay: true,
                startTime: hours[0] as string,
                endTime: hours[1] as string
              };
            } else if (typeof hours === 'object' && hours !== null && 'start' in hours && 'end' in hours) {
              const typedHours = hours as { start: string; end: string };
              newSchedule[day] = {
                isWorkingDay: true,
                startTime: typedHours.start,
                endTime: typedHours.end
              };
            }
          }
        });
      }
      
      // Mark off days
      if (data.off_days && Array.isArray(data.off_days)) {
        data.off_days.forEach(day => {
          if (newSchedule[day]) {
            newSchedule[day].isWorkingDay = false;
          }
        });
      }
      
      setWorkSchedule(newSchedule);
    } catch (error) {
      console.error("Error fetching employee schedule:", error);
      toast({
        title: "Error",
        description: "Failed to load employee schedule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    fetchEmployeeSchedule(employeeId);
  };

  const updateSchedule = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsUpdating(true);
      
      // Prepare working hours object
      const workingHours: Record<string, [string, string]> = {};
      const offDays: string[] = [];
      
      Object.entries(workSchedule).forEach(([day, schedule]) => {
        if (schedule.isWorkingDay) {
          workingHours[day] = [schedule.startTime, schedule.endTime];
        } else {
          offDays.push(day);
        }
      });
      
      const { error } = await supabase
        .from('employees')
        .update({
          working_hours: workingHours,
          off_days: offDays
        })
        .eq('id', selectedEmployee);
      
      if (error) throw error;
      
      toast({
        title: "Schedule updated",
        description: "Employee schedule has been updated successfully",
      });
      
      if (onScheduleUpdate) {
        onScheduleUpdate();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update employee schedule",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateDaySchedule = (day: string, key: keyof typeof workSchedule[string], value: boolean | string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: value
      }
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Employee Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="employee-select">Select Employee</Label>
            <Select
              value={selectedEmployee || ""}
              onValueChange={handleEmployeeSelect}
            >
              <SelectTrigger id="employee-select" className="w-full">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/3">
            <Label htmlFor="view-mode">View Mode</Label>
            <Select
              value={viewMode}
              onValueChange={(value: 'day' | 'week') => setViewMode(value)}
            >
              <SelectTrigger id="view-mode" className="w-full">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedEmployee ? (
          <>
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {daysOfWeek.map(day => (
                  <Card key={day.key} className="overflow-hidden">
                    <CardHeader className="py-2 px-3 bg-muted/30">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium">{day.label}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`working-day-${day.key}`}
                            checked={workSchedule[day.key]?.isWorkingDay || false}
                            onCheckedChange={(checked) => 
                              updateDaySchedule(day.key, 'isWorkingDay', checked)
                            }
                          />
                          <Label htmlFor={`working-day-${day.key}`} className="text-xs">
                            {workSchedule[day.key]?.isWorkingDay ? 'Working' : 'Off'}
                          </Label>
                        </div>
                      </div>
                    </CardHeader>
                    {workSchedule[day.key]?.isWorkingDay && (
                      <CardContent className="py-3 px-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Start</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-start"
                                >
                                  <Clock className="mr-2 h-3 w-3" />
                                  {workSchedule[day.key]?.startTime || "09:00"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <TimePickerInput
                                  value={workSchedule[day.key]?.startTime || "09:00"}
                                  onChange={(time) => updateDaySchedule(day.key, 'startTime', time)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label className="text-xs">End</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full justify-start"
                                >
                                  <Clock className="mr-2 h-3 w-3" />
                                  {workSchedule[day.key]?.endTime || "17:00"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <TimePickerInput
                                  value={workSchedule[day.key]?.endTime || "17:00"}
                                  onChange={(time) => updateDaySchedule(day.key, 'endTime', time)}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={updateSchedule}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Select an employee to manage their schedule</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 