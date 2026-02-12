
import { useQuery } from "@tanstack/react-query";

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { supabase } from "@shared/lib/supabase/client";

import { LeaveBalance } from "@/features/manager/types/employeeHolidays";

export const useEmployeeLeaveBalance = (employeeId: string) => {
  // Realtime: auto-refetch when holidays change
  useRealtimeSubscription({
    table: 'employee_holidays',
    queryKeys: [['employee_holidays', employeeId], ['employee', employeeId]],
  });
  // Fetch employee holidays
  const { data: leaveData, isLoading: isLoadingLeave } = useQuery({
    queryKey: ['employee_holidays', employeeId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("employee_holidays")
          .select("*")
          .eq('employee_id', employeeId);

        if (error) {
          return [];
        }

        return data || [];
      } catch {
        return [];
      }
    }
  });

  // Fetch employee information to get start date
  const { data: employeeData, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, name, start_date, annual_leave_quota")
          .eq('id', employeeId)
          .single();

        if (error) {
          return null;
        }

        return data;
      } catch {
        return null;
      }
    }
  });

  // Calculate leave balance
  const calculateLeaveBalance = (): LeaveBalance | null => {
    if (!employeeData || !employeeData.start_date) return null;

    // Calculate entitled leave based on employment duration
    const startDate = new Date(employeeData.start_date);
    const currentDate = new Date();
    
    // Calculate months of employment (including partial months)
    const months = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                  (currentDate.getMonth() - startDate.getMonth()) +
                  (currentDate.getDate() >= startDate.getDate() ? 0 : -1);
    
    // Get annual leave quota from employee data or use default 21
    const annualLeaveQuota = employeeData.annual_leave_quota ? 
      Number(employeeData.annual_leave_quota) : 21;
    
    // Monthly accrual based on employee's annual quota
    const monthlyAccrual = annualLeaveQuota / 12;
    
    // Calculate entitled days based on accrual rate
    const entitledDays = Math.max(0, parseFloat((months * monthlyAccrual).toFixed(2)));
    
    // Calculate days taken - duration_days is now number
    const totalDaysTaken = !leaveData?.length ? 0 : leaveData.reduce((total, leave) => {
      const duration = leave.duration_days ? Number(leave.duration_days) : 0;
      return total + duration;
    }, 0);
    
    // Calculate remaining days
    const daysRemaining = parseFloat((entitledDays - totalDaysTaken).toFixed(2));
    
    return {
      totalDaysTaken,
      entitledDays,
      daysRemaining,
      isNegative: daysRemaining < 0
    };
  };

  const leaveBalance = !isLoadingEmployee && employeeData ? calculateLeaveBalance() : null;
  const isLoading = isLoadingLeave || isLoadingEmployee;

  return {
    leaveBalance,
    leaveData,
    isLoading
  };
};
