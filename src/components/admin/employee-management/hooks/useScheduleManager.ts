
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useScheduleManager = (onScheduleUpdate?: () => void) => {
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

  return {
    selectedEmployee,
    viewMode, 
    workSchedule,
    isUpdating,
    daysOfWeek,
    setViewMode,
    handleEmployeeSelect,
    updateSchedule,
    updateDaySchedule
  };
};
