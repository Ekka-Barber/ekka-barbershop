import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TimeRange, WorkingHours } from '@/types/employee';
import { Json } from '@/types/supabase-generated';

export const useScheduleManager = (onScheduleUpdate?: () => void) => {
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [workSchedule, setWorkSchedule] = useState<WorkingHours>({});
  const [offDays, setOffDays] = useState<string[]>([]);
  // Keep track of the last known working hours for each day
  const [lastKnownSchedule, setLastKnownSchedule] = useState<WorkingHours>({});

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

  // Parse and normalize the working hours from the database
  const parseWorkingHours = useCallback((dbWorkingHours: Json): WorkingHours => {
    const result: WorkingHours = {};
    
    if (!dbWorkingHours || typeof dbWorkingHours !== 'object' || Array.isArray(dbWorkingHours)) {
      return result;
    }

    // Safe type cast since we've already checked it's an object and not an array
    const workingHoursObj = dbWorkingHours as Record<string, Json>;

    daysOfWeek.forEach(day => {
      const dayKey = day.key;
      result[dayKey] = [];

      // Get working hours for the current day
      const dayHours = workingHoursObj[dayKey];
      
      // Skip if no hours for this day
      if (!dayHours) return;
      
      // Handle array of strings (DB format: ["09:00-17:00", "18:00-20:00"])
      if (Array.isArray(dayHours)) {
        // Filter out non-string values and map to TimeRange
        result[dayKey] = dayHours
          .filter(item => typeof item === 'string')
          .map(item => item as TimeRange);
      } 
      // Handle object format with start/end (DB format: { start: "09:00", end: "17:00" })
      else if (typeof dayHours === 'object' && dayHours !== null) {
        const hourObj = dayHours as { start?: string; end?: string };
        if (hourObj.start && hourObj.end) {
          result[dayKey] = [`${hourObj.start}-${hourObj.end}`];
        }
      }
    });
    
    return result;
  }, [daysOfWeek]);

  // Fetch employee schedule when an employee is selected
  const fetchEmployeeSchedule = useCallback(async (employeeId: string) => {
    if (!employeeId) return;
    
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('employees')
        .select('working_hours, off_days')
        .eq('id', employeeId)
        .single();

      if (error) throw error;

      // Parse working hours from database
      const parsedWorkingHours = parseWorkingHours(data.working_hours);
      
      setWorkSchedule(parsedWorkingHours);
      setLastKnownSchedule({...parsedWorkingHours});
      setOffDays(Array.isArray(data.off_days) ? data.off_days : []);
      
      console.log('Fetched schedule:', parsedWorkingHours);
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
  }, [parseWorkingHours, toast]);

  const handleEmployeeSelect = useCallback((employeeId: string) => {
    setSelectedEmployee(employeeId);
    fetchEmployeeSchedule(employeeId);
  }, [fetchEmployeeSchedule]);

  const updateSchedule = async () => {
    if (!selectedEmployee) return;
    
    try {
      setIsUpdating(true);
      
      // Filter out empty arrays from the schedule
      const cleanedSchedule: Record<string, string[]> = {};
      Object.entries(workSchedule).forEach(([day, ranges]) => {
        if (ranges.length > 0) {
          cleanedSchedule[day] = ranges;
        }
      });
      
      console.log('Saving schedule:', cleanedSchedule);
      
      const { error } = await supabase
        .from('employees')
        .update({
          working_hours: cleanedSchedule,
          off_days: offDays
        })
        .eq('id', selectedEmployee);
      
      if (error) throw error;

      // Update last known schedule after successful save
      setLastKnownSchedule(prev => ({
        ...prev,
        ...workSchedule
      }));
      
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

  const updateDaySchedule = useCallback((day: string, timeRanges: TimeRange[], isWorkingDay: boolean) => {
    // Update working hours
    setWorkSchedule(prev => {
      const newSchedule = { ...prev };
      
      if (isWorkingDay) {
        // If toggling to working, use last known hours or default
        if (timeRanges.length === 0) {
          const lastKnownHours = lastKnownSchedule[day];
          newSchedule[day] = lastKnownHours?.length > 0 
            ? [...lastKnownHours]  // Use last known hours if available
            : ["09:00-17:00"];  // Default hours if no previous hours
        } else {
          newSchedule[day] = [...timeRanges];
        }
      } else {
        // If toggling to off, save current hours to last known before clearing
        if (prev[day]?.length > 0) {
          setLastKnownSchedule(lastKnown => ({
            ...lastKnown,
            [day]: [...prev[day]]
          }));
        }
        newSchedule[day] = [];
      }
      
      return newSchedule;
    });

    // Update off days
    setOffDays(prev => {
      const newOffDays = [...prev];
      const dayIndex = newOffDays.indexOf(day);
      
      if (!isWorkingDay && dayIndex === -1) {
        newOffDays.push(day);
      } else if (isWorkingDay && dayIndex !== -1) {
        newOffDays.splice(dayIndex, 1);
      }
      
      return newOffDays;
    });
  }, [lastKnownSchedule]);

  const isDayWorking = useCallback((day: string): boolean => {
    return workSchedule[day]?.length > 0 && !offDays.includes(day);
  }, [workSchedule, offDays]);

  const getDayTimeRanges = useCallback((day: string): TimeRange[] => {
    return workSchedule[day] || [];
  }, [workSchedule]);

  return {
    selectedEmployee,
    workSchedule,
    isUpdating,
    daysOfWeek,
    handleEmployeeSelect,
    updateSchedule,
    updateDaySchedule,
    isDayWorking,
    getDayTimeRanges
  };
};
