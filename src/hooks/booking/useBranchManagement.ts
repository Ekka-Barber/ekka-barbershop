
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "@/types/booking";
import { useLocation } from "react-router-dom";
import { useBookingContext } from "@/contexts/BookingContext";
import { useEffect } from "react";

export const useBranchManagement = () => {
  const location = useLocation();
  const { dispatch } = useBookingContext();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const { data: branch, isLoading, error } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;

      // Transform working_hours to match WorkingHours interface
      const working_hours = data.working_hours as Record<string, string[]>;
      return {
        ...data,
        working_hours: {
          monday: working_hours.monday || [],
          tuesday: working_hours.tuesday || [],
          wednesday: working_hours.wednesday || [],
          thursday: working_hours.thursday || [],
          friday: working_hours.friday || [],
          saturday: working_hours.saturday || [],
          sunday: working_hours.sunday || [],
        }
      } as Branch;
    },
    enabled: !!branchId,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (branch) {
      console.log('Setting branch in context:', branch);
      dispatch({ type: 'SET_BRANCH', payload: branch });
    }
  }, [branch, dispatch]);

  return {
    branch,
    isLoading,
    error,
    branchId
  };
};
